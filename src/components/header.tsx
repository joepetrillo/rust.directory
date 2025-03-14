import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 flex w-full max-w-full items-center border-b bg-background">
      <div className="mx-3 flex w-full border-x md:mx-8 lg:mx-12">
        <nav className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-2 md:max-w-7xl md:px-6 lg:gap-0">
          <Link
            className="font-editorial text-xl italic transition-transform duration-100 hover:scale-110"
            href="/"
          >
            Rust Directory
          </Link>
          <Drawer direction="bottom">
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-3xl">
                <DrawerHeader>
                  <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                  <DrawerDescription>
                    This action cannot be undone.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Submit</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </nav>
      </div>
    </header>
  );
}
