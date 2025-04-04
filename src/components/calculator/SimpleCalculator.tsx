"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import raidData from "@/data/raid-data.json";
import {
  BoomQuantities,
  RaidData,
  ResourcesRequired,
} from "@/types/calculator";
import { MinusIcon, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ItemBreakdown {
  directCosts: ResourcesRequired;
  totalBaseCosts: ResourcesRequired;
  craftingTree: CraftingNode[];
}

interface CraftingNode {
  resourceName: string;
  amount: number;
  children: CraftingNode[];
}

type BreakdownMap = Record<string, ItemBreakdown>;

export default function SimpleCalculator() {
  const [quantities, setQuantities] = useState<BoomQuantities>({});
  const [itemBreakdowns, setItemBreakdowns] = useState<BreakdownMap>({});
  const [totalResources, setTotalResources] = useState<ResourcesRequired>({});

  const calculateResources = useCallback(() => {
    const typedData = raidData as unknown as RaidData;
    const typedBoom = typedData.boom;
    const typedResources = typedData.resources;

    // Clear previous calculations
    const breakdowns: BreakdownMap = {};
    const finalTotals: ResourcesRequired = {};

    // Helper function to process a resource and build the crafting tree
    const processResourceNode = (
      resourceName: string,
      amount: number,
      node: CraftingNode,
      itemTotals: ResourcesRequired,
      finalTotals: ResourcesRequired,
    ) => {
      // Find the resource
      const resourceItem = typedResources.find(
        (r) => r.shortName === resourceName,
      );
      const boomItem = typedBoom.find((b) => b.shortName === resourceName);
      const item = resourceItem || boomItem;

      // If it has crafting requirements and is not a base resource, process them
      if (item && item.craftingCost && !item.isBaseResource) {
        Object.entries(item.craftingCost).forEach(
          ([subResourceName, subAmount]) => {
            const totalSubAmount = (subAmount as number) * amount;

            // Create child node
            const childNode: CraftingNode = {
              resourceName: subResourceName,
              amount: totalSubAmount,
              children: [],
            };

            // Add to parent's children
            node.children.push(childNode);

            // Recursively process this child
            processResourceNode(
              subResourceName,
              totalSubAmount,
              childNode,
              itemTotals,
              finalTotals,
            );
          },
        );
      } else {
        // Base resource - add to totals
        itemTotals[resourceName] = (itemTotals[resourceName] || 0) + amount;
        finalTotals[resourceName] = (finalTotals[resourceName] || 0) + amount;
      }
    };

    // Process each boom item separately
    Object.entries(quantities).forEach(([shortName, quantity]) => {
      if (quantity <= 0) return;

      const boomItem = typedBoom.find((item) => item.shortName === shortName);
      if (!boomItem) return;

      // Initialize breakdown for this item
      const breakdown: ItemBreakdown = {
        directCosts: {},
        totalBaseCosts: {},
        craftingTree: [],
      };

      // Add direct crafting costs
      Object.entries(boomItem.craftingCost).forEach(
        ([resourceName, amount]) => {
          const totalAmount = amount * quantity;
          breakdown.directCosts[resourceName] = totalAmount;

          // Create first level nodes for crafting tree
          const node: CraftingNode = {
            resourceName,
            amount: totalAmount,
            children: [],
          };
          breakdown.craftingTree.push(node);

          // Process this resource and its children
          processResourceNode(
            resourceName,
            totalAmount,
            node,
            breakdown.totalBaseCosts,
            finalTotals,
          );
        },
      );

      breakdowns[shortName] = breakdown;
    });

    setItemBreakdowns(breakdowns);
    setTotalResources(finalTotals);
  }, [quantities]);

  useEffect(() => {
    calculateResources();
  }, [quantities, calculateResources]);

  const handleQuantityChange = (shortName: string, value: string) => {
    // Only allow digits
    if (!/^[0-9]*$/.test(value)) return;

    // Early returns if value is already at max or min to prevent unnecessary re-renders
    if (quantities[shortName] === 9999 && parseInt(value) >= 9999) return;
    if (quantities[shortName] === 0 && parseInt(value) <= 0) return;

    const numValue = parseInt(value);
    const clampedValue = Math.min(numValue, 9999);

    setQuantities((prev) => ({
      ...prev,
      [shortName]: clampedValue,
    }));
  };

  const incrementQuantity = (shortName: string) => {
    setQuantities((prev) => {
      const currentValue = prev[shortName] ?? 0;
      if (currentValue >= 9999) return prev;

      return {
        ...prev,
        [shortName]: currentValue + 1,
      };
    });
  };

  const decrementQuantity = (shortName: string) => {
    setQuantities((prev) => {
      const currentValue = prev[shortName] ?? 0;
      if (currentValue <= 0) return prev;

      return {
        ...prev,
        [shortName]: currentValue - 1,
      };
    });
  };

  const clearQuantity = (shortName: string) => {
    const newQuantities = { ...quantities };
    delete newQuantities[shortName];
    setQuantities(newQuantities);
  };

  const resetCalculator = () => {
    setQuantities({});
    setItemBreakdowns({});
    setTotalResources({});
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

  // Helper to render resource with image and count
  const ResourceDisplay = ({
    resourceName,
    amount,
    isTopLevel = false,
  }: {
    resourceName: string;
    amount: number;
    isTopLevel?: boolean;
  }) => {
    const details = getResourceItemDetails(resourceName);
    return (
      <div className="relative flex items-center gap-2">
        {!isTopLevel && (
          <div className="absolute top-[11px] -left-[27px] h-[2px] w-5 bg-border" />
        )}
        <div className="relative h-6 w-6 flex-shrink-0">
          <Image
            src={`https://cdn.rusthelp.com/images/public/128/${resourceName}.png`}
            alt={details?.displayName || resourceName}
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
  };

  // Recursive component to render the crafting tree
  const CraftingTreeNode = ({
    node,
    depth = 0,
  }: {
    node: CraftingNode;
    depth?: number;
  }) => {
    const hasChildren = node.children.length > 0;

    return (
      <div className={`space-y-1.5 ${depth > 0 ? "ml-4" : ""}`}>
        <ResourceDisplay
          resourceName={node.resourceName}
          amount={node.amount}
          isTopLevel={depth === 0}
        />
        {hasChildren && (
          <div className="relative pl-6">
            <div className="absolute top-0 bottom-[11px] left-[11px] w-[2px] bg-border" />
            <div className="space-y-1.5">
              {node.children.map((child, index) => (
                <CraftingTreeNode key={index} node={child} depth={depth + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Item Selection</h2>
        <Button variant="secondary" size="sm" onClick={resetCalculator}>
          Reset
        </Button>
      </div>

      {/* Boom selection */}
      <div className="grid auto-rows-fr grid-cols-2 gap-[1px] md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {typedData.boom.map((item) => (
          <div
            key={item.shortName}
            className="relative p-3 outline outline-offset-0 outline-border"
          >
            {quantities[item.shortName] > 0 && (
              <Button
                type="button"
                onClick={() => clearQuantity(item.shortName)}
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full p-0"
                aria-label="Clear quantity"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
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
              <div className="flex items-center">
                <Button
                  type="button"
                  onClick={() => decrementQuantity(item.shortName)}
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-l-md rounded-r-none focus:z-10"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Input
                  inputMode="numeric"
                  value={quantities[item.shortName] || ""}
                  onChange={(e) =>
                    handleQuantityChange(item.shortName, e.target.value)
                  }
                  onFocus={(e) => e.target.select()}
                  className="h-8 w-16 rounded-none text-center text-sm focus:z-10"
                  placeholder="0"
                  aria-label="Quantity"
                />
                <Button
                  type="button"
                  onClick={() => incrementQuantity(item.shortName)}
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-l-none rounded-r-md focus:z-10"
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cost breakdown */}
      {anyItemSelected && Object.keys(itemBreakdowns).length > 0 && (
        <div className="space-y-4">
          {/* Individual cost breakdown */}
          <h3 className="text-lg font-semibold">Cost Breakdown</h3>
          <Accordion type="single" collapsible>
            {Object.entries(itemBreakdowns).map(
              ([itemShortName, breakdown]) => {
                const item = getResourceItemDetails(itemShortName);
                const quantity = quantities[itemShortName];
                if (!item || !quantity) return null;

                return (
                  <AccordionItem key={itemShortName} value={itemShortName}>
                    <AccordionTrigger className="items-center py-3">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 flex-shrink-0">
                          <Image
                            src={`https://cdn.rusthelp.com/images/public/128/${itemShortName}.png`}
                            alt={item.displayName}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        </div>
                        <span>{item.displayName}</span>
                        <Badge variant="secondary">{quantity}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {/* Direct components */}
                        <div className="overflow-auto rounded-md border p-3">
                          <h4 className="mb-3 text-sm font-bold italic">
                            Direct Components
                          </h4>
                          <div className="space-y-1.5">
                            {Object.entries(breakdown.directCosts).map(
                              ([resourceName, amount]) => (
                                <ResourceDisplay
                                  key={resourceName}
                                  resourceName={resourceName}
                                  amount={amount}
                                  isTopLevel={true}
                                />
                              ),
                            )}
                          </div>
                        </div>

                        {/* Crafting tree */}
                        <div className="overflow-auto rounded-md border p-3">
                          <h4 className="mb-3 text-sm font-bold italic">
                            Crafting Breakdown
                          </h4>
                          <div className="space-y-1.5">
                            {breakdown.craftingTree.map((node, index) => (
                              <CraftingTreeNode node={node} key={index} />
                            ))}
                          </div>
                        </div>

                        {/* Base resources summary for this item */}
                        <div className="overflow-auto rounded-md border p-3">
                          <h4 className="mb-3 text-sm font-bold italic">
                            Base Resources Total
                          </h4>
                          <div className="space-y-1.5">
                            {Object.entries(breakdown.totalBaseCosts)
                              .sort((a, b) => b[1] - a[1]) // Sort by amount desc
                              .map(([resourceName, amount]) => (
                                <ResourceDisplay
                                  key={resourceName}
                                  resourceName={resourceName}
                                  amount={amount}
                                  isTopLevel={true}
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              },
            )}
          </Accordion>

          {/* Total resources section */}
          <div className="mt-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              Total Base Resources
              <Badge variant="outline" className="ml-1">
                Final Cost
              </Badge>
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Object.entries(totalResources)
                .sort((a, b) => b[1] - a[1]) // Sort by amount desc
                .map(([resourceName, amount]) => {
                  const resourceDetails = getResourceItemDetails(resourceName);
                  return (
                    <div
                      key={resourceName}
                      className="flex items-center gap-2 rounded-md border bg-muted/10 p-2"
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
        </div>
      )}
    </div>
  );
}
