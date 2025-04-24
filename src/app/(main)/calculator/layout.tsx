"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentTab = pathname.includes("advanced") ? "advanced" : "simple";

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Raid Calculator</h1>
      <p className="mb-4 max-w-prose text-balance text-muted-foreground">
        Calculate everything needed for your raids. Choose between simple and
        advanced mode. All calculations are based on vanilla game values.
      </p>

      <Tabs value={currentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="simple" asChild>
            <Link href="/calculator/simple" replace>
              Simple
            </Link>
          </TabsTrigger>
          <TabsTrigger value="advanced" asChild>
            <Link href="/calculator/advanced" replace>
              Advanced
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
}
