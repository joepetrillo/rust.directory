"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentTab = pathname.includes("advanced") ? "advanced" : "simple";

  const handleTabChange = (value: string) => {
    if (value === "simple") {
      router.replace("/calculator/simple");
    } else {
      router.replace("/calculator/advanced");
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Raid Calculator</h1>
      <p className="mb-4 max-w-prose text-balance text-muted-foreground">
        Calculate everything needed for your raids. Choose between simple and
        advanced mode. All calculations are based on vanilla game values.
      </p>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
}
