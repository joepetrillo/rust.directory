"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";

export default function TestPage() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSteamLogin() {
    try {
      // The response from signInSteam contains a redirect URL we need to navigate to
      const { data } = await authClient.signIn.steam({
        query: {
          returnTo: pathname || "/",
        },
      });

      if (data && "redirect" in data) {
        router.push(data.redirect);
      }
    } catch (error) {
      console.error("Steam sign-in initiation failed:", error);
    }
  }

  return (
    <div>
      <Button onClick={handleSteamLogin}>Sign in with Steam</Button>
      <Button onClick={() => authClient.signOut()}>Sign out</Button>
    </div>
  );
}
