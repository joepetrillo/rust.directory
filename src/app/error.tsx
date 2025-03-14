"use client";

import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <h1 className="mb-1 font-editorial text-3xl font-light italic">
        Something Went Wrong
      </h1>
      <p className="mb-2 text-center text-balance text-muted-foreground">
        An error has occurred. Please try again later.
      </p>
      <Link className={buttonVariants({ variant: "link" })} href="/">
        <ArrowLeft /> Go Home
      </Link>
    </div>
  );
}
