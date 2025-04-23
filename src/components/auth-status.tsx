"use client";

import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AuthStatus() {
  const [isMounted, setIsMounted] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { data: session, isPending, error } = authClient.useSession();

  useEffect(() => {
    setIsMounted(true);
    if (!isPending) {
      setInitialLoad(false);
    }
  }, [isPending]);

  if (!isMounted) {
    return null;
  }

  if (isPending && initialLoad) {
    return null;
  }

  if (error) {
    throw error;
  }

  const sessionStatus = session ? "authenticated" : "unauthenticated";

  if (!session) {
    return (
      <div
        key={sessionStatus}
        className="duration-300 ease-in-out animate-in fade-in"
      >
        <p>No Session</p>
      </div>
    );
  }

  return (
    <div
      key={sessionStatus}
      className="duration-300 ease-in-out animate-in fade-in"
    >
      <div className="flex items-center gap-2">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt="User avatar"
            width={32}
            height={32}
          />
        )}
        <p>{session.user.name}</p>
      </div>
    </div>
  );
}
