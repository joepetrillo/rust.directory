"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function RaidCalculator() {
  return (
    <Alert className="max-w-xl">
      <AlertCircle />
      <AlertTitle>Coming Soon</AlertTitle>
      <AlertDescription>
        The Raid Planner will provide optimized raiding strategies based on your
        available explosives and target structures. This feature is currently in
        development.
      </AlertDescription>
    </Alert>
  );
}
