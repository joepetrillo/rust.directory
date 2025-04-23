import type { BetterAuthClientPlugin } from "better-auth/client";
import type { steam } from "./index";

export const steamClient = () => {
  return {
    id: "steam-client",
    $InferServerPlugin: {} as ReturnType<typeof steam>,
  } satisfies BetterAuthClientPlugin;
};
