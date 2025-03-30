"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import raidData from "@/data/raid-data.json";
import {
  BoomQuantities,
  RaidData,
  ResourcesRequired,
} from "@/types/calculator";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function SimpleCalculator() {
  const [quantities, setQuantities] = useState<BoomQuantities>({});
  const [requiredResources, setRequiredResources] = useState<ResourcesRequired>(
    {},
  );

  const calculateResources = useCallback(() => {
    const resources: ResourcesRequired = {};
    const processedItems = new Set<string>();
    const typedData = raidData as unknown as RaidData;
    const typedBoom = typedData.boom;
    const typedResources = typedData.resources;

    // Initialize with direct boom items
    Object.entries(quantities).forEach(([shortName, quantity]) => {
      if (quantity <= 0) return;

      const boomItem = typedBoom.find((item) => item.shortName === shortName);
      if (!boomItem) return;

      // Add direct crafting costs
      Object.entries(boomItem.craftingCost).forEach(
        ([resourceName, amount]) => {
          resources[resourceName] =
            (resources[resourceName] || 0) + amount * quantity;
        },
      );
    });

    // Process nested crafting requirements until we reach base resources
    let hasChanges = true;
    while (hasChanges) {
      hasChanges = false;

      // Create a copy of the current resources to work with
      const currentResources = { ...resources };

      // Check each resource to see if it needs further processing
      Object.entries(currentResources).forEach(([resourceName, amount]) => {
        // Skip already processed items
        if (processedItems.has(resourceName)) return;

        // Find resource in either boom or resources arrays
        const resourceItem = typedResources.find(
          (r) => r.shortName === resourceName,
        );
        const boomItem = typedBoom.find((b) => b.shortName === resourceName);
        const item = resourceItem || boomItem;

        if (item && item.craftingCost && !item.isBaseResource) {
          // Remove this item from resources
          delete resources[resourceName];

          // Add its crafting requirements instead
          Object.entries(item.craftingCost).forEach(
            ([subResourceName, subAmount]) => {
              resources[subResourceName] =
                (resources[subResourceName] || 0) + subAmount * amount;
            },
          );

          hasChanges = true;
        }

        // Mark as processed
        processedItems.add(resourceName);
      });
    }

    setRequiredResources(resources);
  }, [quantities]);

  useEffect(() => {
    calculateResources();
  }, [quantities, calculateResources]);

  const handleQuantityChange = (shortName: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities({
      ...quantities,
      [shortName]: numValue >= 0 ? numValue : 0,
    });
  };

  const resetCalculator = () => {
    setQuantities({});
    setRequiredResources({});
  };

  const getResourceItemDetails = (shortName: string) => {
    const typedData = raidData as unknown as RaidData;
    return (
      typedData.resources.find((r) => r.shortName === shortName) ||
      typedData.boom.find((b) => b.shortName === shortName)
    );
  };

  const anyItemSelected = Object.values(quantities).some((q) => q > 0);
  const typedData = raidData as unknown as RaidData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Item Selection</h2>
        <Button variant="secondary" size="sm" onClick={resetCalculator}>
          Reset
        </Button>
      </div>

      <div className="grid auto-rows-fr grid-cols-2 gap-[1px] md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {typedData.boom.map((item) => (
          <div
            key={item.shortName}
            className="p-3 outline outline-offset-0 outline-border"
          >
            <div className="flex h-full flex-col items-center justify-between gap-3">
              <div className="relative h-12 w-12 flex-shrink-0">
                <Image
                  src={`https://cdn.rusthelp.com/images/public/128/${item.shortName}.png`}
                  alt={item.displayName}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <p className="text-center text-sm font-medium">
                {item.displayName}
              </p>
              <Input
                type="number"
                min="0"
                value={quantities[item.shortName] || ""}
                onChange={(e) =>
                  handleQuantityChange(item.shortName, e.target.value)
                }
                className="h-8 w-20 text-sm"
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </div>

      {anyItemSelected && Object.keys(requiredResources).length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">Resources Required</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Object.entries(requiredResources).map(([resourceName, amount]) => {
              const resourceDetails = getResourceItemDetails(resourceName);
              return (
                <div
                  key={resourceName}
                  className="flex items-center gap-2 rounded-md border p-2"
                >
                  <div className="relative h-10 w-10 flex-shrink-0">
                    <Image
                      src={`https://cdn.rusthelp.com/images/public/128/${resourceName}.png`}
                      alt={resourceDetails?.displayName || resourceName}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {resourceDetails?.displayName || resourceName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
