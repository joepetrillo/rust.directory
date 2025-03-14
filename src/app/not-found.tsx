import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8">
      <h1 className="mb-1 font-editorial text-3xl font-light italic">
        Page Not Found
      </h1>
      <p className="mb-2 text-center text-balance text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link className={buttonVariants({ variant: "link" })} href="/">
        <ArrowLeft /> Go Home
      </Link>
    </div>
  );
}
