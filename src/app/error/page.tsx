import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>;
}) {
  const params = await searchParams;
  let message = "An error has occurred.";

  if (params.code === "STEAM_AUTHENTICATION_FAILED") {
    message = "Failed to sign in with Steam.";
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <h1 className="mb-1 text-center font-editorial text-3xl font-light text-balance italic">
        Something Went Wrong
      </h1>
      <p className="mb-2 text-center text-balance text-muted-foreground">
        {message} Please try again later.
      </p>
      <Link className={buttonVariants({ variant: "link" })} href="/">
        <ArrowLeft /> Go Home
      </Link>
    </div>
  );
}
