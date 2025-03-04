import { GitHubLogoIcon, HeartFilledIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="px-4 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
        <Link href="/" className="text-sm hover:underline">
          rust.directory
        </Link>
        <div className="flex items-center gap-2">
          <Link href="https://github.com/joepetrillo" target="_blank">
            <GitHubLogoIcon />
          </Link>
          <Link href="https://buymeacoffee.com/jpetrillo" target="_blank">
            <HeartFilledIcon />
          </Link>
        </div>
      </div>
    </footer>
  );
}
