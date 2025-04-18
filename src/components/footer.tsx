import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiGithub, SiSteam } from "@icons-pack/react-simple-icons";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-3 border-x md:mx-8 lg:mx-12">
        <div className="mx-auto flex w-full items-center justify-between gap-8 px-4 py-2 md:max-w-7xl md:px-6 lg:gap-0">
          <p className="text-xs leading-4 text-balance text-muted-foreground">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "link" }),
                "h-auto rounded-xs p-0 text-xs",
              )}
            >
              rust.directory
            </Link>{" "}
            is not affiliated with Facepunch Studios
          </p>
          <div className="flex items-center gap-2">
            <Link
              className={buttonVariants({ variant: "outline", size: "icon" })}
              href="https://steamcommunity.com/id/perfect119"
              target="_blank"
            >
              <SiSteam />
            </Link>
            <Link
              className={buttonVariants({ variant: "outline", size: "icon" })}
              href="https://github.com/joepetrillo/rust.directory"
              target="_blank"
            >
              <SiGithub />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
