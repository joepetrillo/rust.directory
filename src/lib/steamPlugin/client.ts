import type {
  BetterAuthClientPlugin,
  BetterFetchOption,
} from "better-auth/client";
import { steam } from ".";

export const steamClient = () => {
  return {
    id: "steam-client",
    $InferServerPlugin: {} as ReturnType<typeof steam>,
    getActions: ($fetch) => {
      return {
        signIn: {
          steam: async (fetchOptions?: BetterFetchOption) => {
            const res = $fetch("/sign-in/steam", {
              method: "GET",
              ...fetchOptions,
            });
            return res;
          },
        },
      };
    },
  } satisfies BetterAuthClientPlugin;
};
