import type { BetterAuthPlugin, User } from "better-auth";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import openid from "openid";
import { z } from "zod";

const STEAM_ERROR_CODES = {
  STEAM_VERIFICATION_FAILED: "Steam verification failed",
  STEAM_ID_MISSING: "Could not extract Steam ID",
  USER_INFO_FETCH_FAILED: "Failed to fetch user details from Steam API",
  API_KEY_REQUIRED: "Steam API Key is required to fetch user details",
} as const;

// Steam's OpenID Provider endpoint
const STEAM_PROVIDER_URL = "https://steamcommunity.com/openid";

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
        true, // Always use stateless mode for Steam
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
                302: { description: "Redirect to Steam for authentication" },
                400: { description: "Authentication failed to initiate" },
              },
            },
          },
        },
        async (ctx) => {
          const returnTo = ctx.query.returnTo ?? "/";

          // Store the returnTo URL in a cookie
          ctx.setCookie("steam_auth_return_to", returnTo, {
            path: "/",
            maxAge: 10 * 60, // 10 minutes
            sameSite: "lax",
            httpOnly: true,
          });

          try {
            const authUrl = await new Promise<string>((resolve, reject) => {
              relyingParty.authenticate(
                STEAM_PROVIDER_URL,
                false, // Steam does not support immediate mode
                (error, authUrl) => {
                  if (error) {
                    return reject(
                      new Error(`Authentication failed: ${error.message}`),
                    );
                  }
                  if (!authUrl) {
                    return reject(new Error("Authentication failed"));
                  }
                  resolve(authUrl);
                },
              );
            });
            return ctx.json({ redirect: authUrl });
          } catch (error) {
            ctx.context.logger.error("Steam sign-in initiation failed", error);
            throw new APIError("BAD_REQUEST", {
              message:
                (error as Error).message ||
                "Failed to initiate Steam authentication",
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
                    "Redirect to stored returnTo URL on success or root path with error on failure",
                },
              },
            },
          },
        },
        async (ctx) => {
          const returnTo = ctx.getCookie("steam_auth_return_to") || "/";

          // Clear the cookie
          ctx.setCookie("steam_auth_return_to", "", {
            path: "/",
            maxAge: 0,
            expires: new Date(0),
            sameSite: "lax",
            httpOnly: true,
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
                      new Error(`Verification failed: ${error.message}`),
                    );
                  }
                  if (!result || !result.authenticated) {
                    return reject(new Error("Verification failed"));
                  }
                  resolve(result);
                },
              );
            });

            if (!result.authenticated || !result.claimedIdentifier) {
              throw new Error(STEAM_ERROR_CODES.STEAM_VERIFICATION_FAILED);
            }

            // Extract SteamID64
            const steamIdMatch = result.claimedIdentifier.match(
              /https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)/,
            );
            const steamId = steamIdMatch?.[1];

            if (!steamId) {
              throw new Error(STEAM_ERROR_CODES.STEAM_ID_MISSING);
            }

            // Check if user exists
            let dbUser = await ctx.context.internalAdapter.findOAuthUser(
              "", // Steam doesn't provide email via OpenID
              steamId,
              "steam",
            );

            let user: User;
            let session;

            if (dbUser?.user) {
              user = dbUser.user;

              // Update account info
              if (apiKey) {
                const userInfo = await getSteamUserInfo(apiKey, steamId);
                const updateData: { name?: string; image?: string } = {};

                // Collect all changes in one object
                if (
                  user.name !== userInfo.personaname &&
                  userInfo.personaname
                ) {
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
              }
            } else {
              // User doesn't exist, create new user
              // Fetch additional user details using Steam Web API
              if (!apiKey) {
                ctx.context.logger.warn(STEAM_ERROR_CODES.API_KEY_REQUIRED);
                // Create user with minimal info if API key is missing
                user = await ctx.context.internalAdapter.createUser(
                  {
                    name: `Steam User ${steamId.slice(-4)}`, // Placeholder name
                    email: `steam_${steamId}@example.com`, // Placeholder email
                    emailVerified: false, // Steam doesn't verify email via OpenID
                  },
                  ctx,
                );
              } else {
                const userInfo = await getSteamUserInfo(apiKey, steamId);
                user = await ctx.context.internalAdapter.createUser(
                  {
                    name:
                      userInfo.personaname || `Steam User ${steamId.slice(-4)}`,
                    image: userInfo.avatarfull,
                    email: `steam_${steamId}@example.com`, // Placeholder email
                    emailVerified: false, // Steam doesn't verify email via OpenID
                  },
                  ctx,
                );
              }

              if (!user) {
                throw new Error("Failed to create user");
              }

              // Link Steam account
              await ctx.context.internalAdapter.linkAccount(
                {
                  userId: user.id,
                  providerId: "steam",
                  accountId: steamId,
                },
                ctx,
              );
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
            return ctx.redirect(
              `/?error=${
                (error as Error).message || "Failed to sign in with Steam"
              }`,
            );
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
        (error as Error).message || STEAM_ERROR_CODES.USER_INFO_FETCH_FAILED,
      );
    }

    return { personaname: null, avatarfull: null };
  }
}
