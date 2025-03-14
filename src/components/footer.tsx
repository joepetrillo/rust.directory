import { buttonVariants } from "@/components/ui/button";
import { SiGithub } from "@icons-pack/react-simple-icons";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-3 border-x md:mx-8 lg:mx-12">
        <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-2 md:max-w-7xl md:px-6 lg:gap-0">
          <Link href="/" className={buttonVariants({ variant: "link" })}>
            rust.directory
          </Link>
          <Link
            className={buttonVariants({ variant: "outline", size: "icon" })}
            href="https://github.com/joepetrillo"
            target="_blank"
          >
            <SiGithub />
          </Link>
        </div>
      </div>
    </footer>
  );
}
