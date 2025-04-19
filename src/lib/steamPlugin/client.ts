import type { BetterAuthClientPlugin } from "better-auth";
import type { steamAuth } from ".";

export const genericOAuthClient = () => {
  return {
    id: "steam-auth-client",
    $InferServerPlugin: {} as ReturnType<typeof steamAuth>,
  } satisfies BetterAuthClientPlugin;
};
