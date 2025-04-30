import type { BetterAuthPlugin, User } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  getSessionFromCtx,
} from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import openid from "openid";
import { z } from "zod";

const STEAM_ERROR_CODES = {
  INIT_FAILED: "Failed to initiate Steam authentication",
  ALREADY_AUTHENTICATED: "User is already authenticated",
} as const;

// Steam's OpenID Provider endpoint
const STEAM_PROVIDER_URL = "https://steamcommunity.com/openid";

function getErrorCodeKey(value: string) {
  return Object.keys(STEAM_ERROR_CODES).find(
    (key) => STEAM_ERROR_CODES[key as keyof typeof STEAM_ERROR_CODES] === value,
  );
}

interface SteamPluginOptions {
  /**
   * Steam Web API Key.
   * Required to fetch user details like username and avatar after OpenID verification.
   * Obtain one from: https://steamcommunity.com/dev/apikey
   */
  apiKey?: string;
}

export const steam = (options?: SteamPluginOptions) => {
  const optionsSchema = z
    .object({
      apiKey: z.string().optional(),
    })
    .optional();

  const parsedOptions = optionsSchema.parse(options);
  const apiKey = parsedOptions?.apiKey;

  let relyingParty: openid.RelyingParty;

  return {
    id: "steam",
    init(ctx) {
      const callbackUrl = `${ctx.baseURL}/steam/callback`;

      relyingParty = new openid.RelyingParty(
        callbackUrl,
        null,
        true, // always use stateless mode for Steam
        false,
        [],
      );
    },
    endpoints: {
      signInSteam: createAuthEndpoint(
        "/sign-in/steam",
        {
          method: "GET",
          query: z.object({
            returnTo: z.string().optional(),
          }),
          metadata: {
            openapi: {
              description: "Initiate Steam OpenID sign-in",
              responses: {
                200: { description: "Continue to Steam for authentication" },
                400: { description: "Authentication flow with Steam failed" },
              },
            },
          },
        },
        async (ctx) => {
          // check if the user is already authenticated
          const session = await getSessionFromCtx(ctx);

          if (session) {
            throw new APIError("BAD_REQUEST", {
              code: getErrorCodeKey(STEAM_ERROR_CODES.ALREADY_AUTHENTICATED),
              message: STEAM_ERROR_CODES.ALREADY_AUTHENTICATED,
            });
          }

          // by default, redirect to the root if no 'returnTo' query param is provided
          const returnTo = ctx.query.returnTo || "/";

          // store the returnTo URL in a cookie
          ctx.setCookie(`steam_auth_return_to`, returnTo, {
            path: "/",
            maxAge: 10 * 60, // 10 minutes
            sameSite: "lax",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          });

          try {
            const authUrl = await new Promise<string>((resolve, reject) => {
              relyingParty.authenticate(
                STEAM_PROVIDER_URL,
                false, // steam does not support immediate mode
                (error, authUrl) => {
                  if (error) {
                    return reject(
                      new Error(
                        `Steam authentication failed: ${error.message}`,
                      ),
                    );
                  }
                  if (!authUrl) {
                    return reject(new Error("Steam authentication failed"));
                  }
                  resolve(authUrl);
                },
              );
            });
            return ctx.json({ redirect: true, url: authUrl });
          } catch (error) {
            ctx.context.logger.error("Steam sign-in failed", error);
            throw new APIError("BAD_REQUEST", {
              code: getErrorCodeKey(STEAM_ERROR_CODES.INIT_FAILED),
              message:
                (error as Error).message || STEAM_ERROR_CODES.INIT_FAILED,
            });
          }
        },
      ),
      steamCallback: createAuthEndpoint(
        "/steam/callback",
        {
          method: "GET",
          metadata: {
            openapi: {
              description: "Callback endpoint for Steam OpenID sign-in",
              responses: {
                302: {
                  description:
                    "Redirect to the returnTo URL on success or the error page on failure",
                },
              },
            },
          },
        },
        async (ctx) => {
          // get the returnTo URL from the cookie
          const returnTo = ctx.getCookie("steam_auth_return_to") || "/";

          // clear the cookie after retrieving
          ctx.setCookie("steam_auth_return_to", "", {
            path: "/",
            maxAge: 0,
            sameSite: "lax",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          });

          try {
            const result = await new Promise<{
              authenticated: boolean;
              claimedIdentifier?: string;
            }>((resolve, reject) => {
              relyingParty.verifyAssertion(
                ctx.request?.url || "",
                (error, result) => {
                  if (error) {
                    return reject(
                      new Error(`Steam verification failed: ${error.message}`),
                    );
                  }
                  if (!result) {
                    return reject(new Error("Steam verification failed"));
                  }
                  resolve(result);
                },
              );
            });

            if (!result.authenticated || !result.claimedIdentifier) {
              throw new Error("Steam verification failed");
            }

            // Extract SteamID64
            const steamIdMatch = result.claimedIdentifier.match(
              /https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)/,
            );
            const steamId = steamIdMatch?.[1];

            if (!steamId) {
              throw new Error("Could not extract Steam ID");
            }

            // Check if user exists
            let dbUser = await ctx.context.internalAdapter.findOAuthUser(
              "", // Steam doesn't provide email via OpenID
              steamId,
              "steam",
            );

            let user: User;
            let session;

            // If the user exists and we have an API key, update the user's info if necessary
            if (dbUser && apiKey) {
              user = dbUser.user;

              // Update account info
              const userInfo = await getSteamUserInfo(apiKey, steamId);
              const updateData: { name?: string; image?: string } = {};

              // Collect all changes in one object
              if (user.name !== userInfo.personaname && userInfo.personaname) {
                updateData.name = userInfo.personaname;
              }
              if (user.image !== userInfo.avatarfull && userInfo.avatarfull) {
                updateData.image = userInfo.avatarfull;
              }

              // Only make a DB call if we have changes
              if (Object.keys(updateData).length > 0) {
                await ctx.context.internalAdapter.updateUser(
                  user.id,
                  updateData,
                );
              }
            } else {
              // User doesn't exist, create new user
              // Fetch additional user details using Steam Web API
              if (!apiKey) {
                ctx.context.logger.warn(
                  "A valid Steam API Key is required to fetch user details",
                );
                // Create user with minimal info if API key is missing
                user = await ctx.context.internalAdapter.createUser(
                  {
                    name: `Steam User ${steamId.slice(-4)}`, // Placeholder name
                    email: `steam_${steamId}@rust.directory`, // Placeholder email
                  },
                  ctx,
                );
              }
              // API key is present, fetch user details
              else {
                const userInfo = await getSteamUserInfo(apiKey, steamId);
                const creationResult =
                  await ctx.context.internalAdapter.createOAuthUser(
                    {
                      name:
                        userInfo.personaname ||
                        `Steam User ${steamId.slice(-4)}`,
                      image: userInfo.avatarfull,
                      email: `steam_${steamId}@rust.directory`, // Placeholder email
                      emailVerified: false,
                    },
                    {
                      id: steamId,
                      providerId: "steam",
                      accountId: steamId,
                    },
                    ctx,
                  );
                user = creationResult.user;
              }

              if (!user) {
                throw new Error("Failed to create user");
              }
            }

            // Create session
            session = await ctx.context.internalAdapter.createSession(
              user.id,
              ctx.headers,
            );

            if (!session) {
              throw new Error("Failed to create session");
            }

            // Set session cookie
            await setSessionCookie(ctx, { user, session });

            return ctx.redirect(returnTo);
          } catch (error) {
            ctx.context.logger.error("Steam callback failed", error);
            return ctx.redirect(`/error?code=STEAM_AUTHENTICATION_FAILED`);
          }
        },
      ),
    },
    $ERROR_CODES: STEAM_ERROR_CODES,
  } satisfies BetterAuthPlugin;
};

interface SteamPlayerSummary {
  // Public Data
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0-Offline, 1-Online, 2-Busy, 3-Away, 4-Snooze, 5-Looking to trade, 6-Looking to play
  communityvisibilitystate: 1 | 3; // 1-Not visible (Private/Friends Only), 3-Visible (Public)
  profilestate?: 1; // If set (1), user has a community profile configured
  lastlogoff?: number; // Unix timestamp
  commentpermission?: 1; // If set (1), profile allows public comments

  // Private Data (only available for public profiles or with proper authentication)
  realname?: string;
  primaryclanid?: string;
  timecreated?: number; // Unix timestamp
  gameid?: string;
  gameserverip?: string;
  gameextrainfo?: string;
  loccountrycode?: string; // 2-character ISO country code
  locstatecode?: string;
  loccityid?: number;
}

interface SteamPlayerSummariesResponse {
  response: {
    players: SteamPlayerSummary[];
  };
}

interface StoredSteamUserInfo {
  personaname: string | null;
  avatarfull: string | null;
}

// Helper to fetch user info from Steam Web API
async function getSteamUserInfo(
  apiKey: string,
  steamId: string,
): Promise<StoredSteamUserInfo> {
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Steam API request failed: ${response.statusText}`);
    }
    const data = (await response.json()) as SteamPlayerSummariesResponse;
    const player = data?.response?.players?.[0];
    if (!player) {
      throw new Error("Player data not found in Steam API response");
    }
    return {
      personaname: player.personaname,
      avatarfull: player.avatarfull,
    };
  } catch (error) {
    if (typeof error === "object" && error !== null) {
      console.error(
        (error as Error).message ||
          "Failed to fetch user details from Steam API",
      );
    }

    return { personaname: null, avatarfull: null };
  }
}
