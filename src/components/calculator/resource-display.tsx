import { getItemDetails } from "@/lib/item-utils";
import Image from "next/image";
import { memo } from "react";

interface ResourceDisplayProps {
  resourceName: string;
  amount: number;
  isTopLevel?: boolean;
}

const ResourceDisplay = memo(
  ({ resourceName, amount, isTopLevel = false }: ResourceDisplayProps) => {
    const details = getItemDetails(resourceName);

    if (!details) {
      return null;
    }

    return (
      <div className="relative flex items-center gap-2">
        {!isTopLevel && (
          <div className="absolute top-[11px] -left-[27px] h-[2px] w-5 bg-border" />
        )}
        <div className="relative h-6 w-6 flex-shrink-0">
          <Image
            src={details.iconUrl}
            alt={details.displayName || resourceName}
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
        <span className="text-sm font-medium whitespace-nowrap">
          {details?.displayName || resourceName}
        </span>
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {amount.toLocaleString()}
        </span>
      </div>
    );
  },
);
// This is needed for React DevTools to display the component name correctly
// when using memo() instead of showing "Anonymous Component"
ResourceDisplay.displayName = "ResourceDisplay";

export { ResourceDisplay };
