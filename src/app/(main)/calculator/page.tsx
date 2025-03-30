"use client";

import RaidCalculator from "@/components/calculator/RaidCalculator";
import SimpleCalculator from "@/components/calculator/SimpleCalculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("simple");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Raid Calculator</h1>
      <p className="mb-4 text-balance text-muted-foreground">
        Calculate raid costs and resources needed for your raids. Choose between
        simple and advanced mode based on your needs.
      </p>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="simple">
          <SimpleCalculator />
        </TabsContent>

        <TabsContent value="advanced">
          <RaidCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
