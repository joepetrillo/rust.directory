import { createAuthClient } from "better-auth/react";
import { steamClient } from "./steamPlugin/client";

export const authClient = createAuthClient({
  plugins: [steamClient()],
});
