import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AdvancedCalculator() {
  return (
    <Alert className="max-w-xl">
      <AlertCircle />
      <AlertTitle>Coming Soon</AlertTitle>
      <AlertDescription>
        The advanced calculator will provide optimized strategies based on your
        available explosives and raid targets. This feature is currently in
        development.
      </AlertDescription>
    </Alert>
  );
}
