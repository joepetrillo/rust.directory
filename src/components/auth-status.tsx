"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { ChevronDown, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function AuthStatus() {
  const [initialLoad, setInitialLoad] = useState(true);
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavPending, startTransition] = useTransition();
  const [isSteamLoginPending, setIsSteamLoginPending] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setInitialLoad(false);
    }
  }, [isPending]);

  // if there was an error loading the session
  // TODO - handle this gracefully
  if (error) {
    throw error;
  }

  const sessionStatus = session ? "authenticated" : "unauthenticated";

  async function handleSteamLogin() {
    setIsSteamLoginPending(true);

    try {
      const { data, error } = await authClient.signIn.steam({
        query: {
          returnTo: pathname,
        },
      });

      if (error) {
        if (error.code === "ALREADY_AUTHENTICATED") {
          refetch();
        }
      }

      if (data && data.redirect) {
        startTransition(() => {
          if (data.url) {
            router.push(data.url);
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSteamLoginPending(false);
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await authClient.signOut();

      if (error && error.code === "FAILED_TO_GET_SESSION") {
        refetch();
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (isPending && initialLoad) {
    return null;
  }

  if (!session) {
    return (
      <div
        key={sessionStatus}
        className="transition-opacity duration-300 animate-in fade-in"
      >
        <Button
          onClick={handleSteamLogin}
          size="sm"
          variant="outline"
          loading={isSteamLoginPending || isNavPending || isPending}
          className="cursor-pointer"
        >
          Sign in with Steam
        </Button>
      </div>
    );
  }

  return (
    <div
      key={sessionStatus}
      className="flex items-center transition-opacity duration-300 animate-in fade-in"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-1 px-2" size="sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                {session.user.image && (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || ""}
                  />
                )}
                <AvatarFallback>
                  {session.user.name || session.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block">
                {session.user.name}
              </span>
            </div>
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="max-w-64 min-w-48 rounded-md"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8">
                {session.user.image && (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || ""}
                  />
                )}
                <AvatarFallback>
                  {session.user.name || session.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {session.user.name}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} disabled={isNavPending}>
            <LogOut className="mr-2 size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
