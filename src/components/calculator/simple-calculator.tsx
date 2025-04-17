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
import { cn, roundToIncrement } from "@/lib/utils";
import {
  BreakdownMap,
  CraftingNode,
  Item,
  ItemBreakdown,
  Quantities,
  ResourcesRequired,
} from "@/types/calculator";
import { MinusIcon, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useState } from "react";

const typedData = raidData as unknown as Item[];
const selectableItems = typedData.filter((i) => i.selectable);

const getItemDetails = (shortName: string) => {
  return typedData.find((i) => i.shortName === shortName);
};

const ResourceDisplay = memo(
  ({
    resourceName,
    amount,
    isTopLevel = false,
  }: {
    resourceName: string;
    amount: number;
    isTopLevel?: boolean;
  }) => {
    const details = getItemDetails(resourceName);
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
  },
);
ResourceDisplay.displayName = "ResourceDisplay";

const CraftingTreeNode = memo(
  ({ node, depth = 0 }: { node: CraftingNode; depth?: number }) => {
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
              {node.children
                .sort((a, b) => b.amount - a.amount)
                .map((child, index) => (
                  <CraftingTreeNode
                    key={index}
                    node={child}
                    depth={depth + 1}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);
CraftingTreeNode.displayName = "CraftingTreeNode";

export default function SimpleCalculator() {
  const [quantities, setQuantities] = useState<Quantities>({});
  const [itemBreakdowns, setItemBreakdowns] = useState<BreakdownMap>({});
  const [totalResources, setTotalResources] = useState<ResourcesRequired>({});

  const calculationsExist = Object.values(totalResources).some((q) => q > 0);

  // Helper function to process a resource and build the crafting tree
  const processResourceNode = useCallback(
    (
      resourceName: string,
      amount: number,
      node: CraftingNode,
      itemTotals: ResourcesRequired,
      finalTotals: ResourcesRequired,
    ) => {
      const item = getItemDetails(resourceName);

      // If it has crafting requirements and is not a base resource, process them
      if (item && item.craftingCost && !item.isBaseResource) {
        Object.entries(item.craftingCost).forEach(
          ([subResourceName, subAmount]) => {
            const totalSubAmount = subAmount * amount;

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
    },
    [],
  );

  const calculateResources = useCallback(() => {
    // Clear previous calculations
    const breakdowns: BreakdownMap = {};
    const finalTotals: ResourcesRequired = {};

    // Process each boom item separately
    Object.entries(quantities).forEach(([shortName, quantity]) => {
      if (quantity <= 0) return;

      const item = getItemDetails(shortName);
      if (!item) return;

      // Initialize breakdown for this item
      const breakdown: ItemBreakdown = {
        totalBaseCosts: {},
        craftingTree: [],
      };

      // Add direct crafting costs
      Object.entries(item.craftingCost ?? {}).forEach(
        ([resourceName, amount]) => {
          const totalAmount = amount * quantity;

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
  }, [quantities, processResourceNode]);

  useEffect(() => {
    calculateResources();
  }, [calculateResources]);

  const handleQuantityChange = useCallback(
    (shortName: string, increment: number, value: string) => {
      // Only allow digits
      if (!/^[0-9]*$/.test(value)) return;

      const numValue = parseInt(value);
      const roundedValue = roundToIncrement(numValue, increment);
      const clampedValue = Math.min(roundedValue, 9999);

      setQuantities((prev) => ({
        ...prev,
        [shortName]: clampedValue,
      }));
    },
    [],
  );

  const incrementQuantity = useCallback(
    (shortName: string, increment: number) => {
      setQuantities((prev) => {
        const currentValue = prev[shortName] ?? 0;
        const newValue = currentValue + increment;
        if (newValue > 9999) return prev;

        return {
          ...prev,
          [shortName]: newValue,
        };
      });
    },
    [],
  );

  const decrementQuantity = useCallback(
    (shortName: string, increment: number) => {
      setQuantities((prev) => {
        const currentValue = prev[shortName] ?? 0;
        const newValue = currentValue - increment;
        if (newValue < 0) return prev;
        return {
          ...prev,
          [shortName]: newValue,
        };
      });
    },
    [],
  );

  const clearQuantity = useCallback((shortName: string) => {
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[shortName];
      return newQuantities;
    });
  }, []);

  const resetCalculator = useCallback(() => {
    setQuantities({});
    setItemBreakdowns({});
    setTotalResources({});
  }, []);

  return (
    <div className="space-y-6">
      {/* Item Selection Section */}
      <div>
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Item Selection</h2>
          <Button variant="secondary" size="sm" onClick={resetCalculator}>
            Reset
          </Button>
        </div>

        {/* Boom selection */}
        <div className="grid auto-rows-fr grid-cols-2 gap-[1px] md:grid-cols-3 lg:grid-cols-4">
          {selectableItems.map((item) => (
            <div
              key={item.shortName}
              className={cn(
                "relative p-3 outline outline-offset-0 outline-border",
                quantities[item.shortName] > 0 &&
                  "z-10 outline-muted-foreground",
              )}
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
                    onClick={() =>
                      decrementQuantity(
                        item.shortName,
                        item.craftingIncrement ?? 1,
                      )
                    }
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
                      handleQuantityChange(
                        item.shortName,
                        item.craftingIncrement ?? 1,
                        e.target.value,
                      )
                    }
                    onFocus={(e) => e.target.select()}
                    className="h-8 w-17 rounded-none text-center text-base focus:z-10 sm:text-sm"
                    placeholder="0"
                    aria-label="Quantity"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      incrementQuantity(
                        item.shortName,
                        item.craftingIncrement ?? 1,
                      )
                    }
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
      </div>

      {/* Cost breakdown and Total Resources */}
      {calculationsExist ? (
        <div className="flex flex-col gap-x-6 gap-y-3 md:flex-row">
          {/* Cost breakdown */}
          <div className="md:w-1/2 xl:w-1/3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              Cost Breakdown
              <Badge variant="outline" className="ml-1">
                Per Item
              </Badge>
            </h3>
            <Accordion type="single" collapsible>
              {Object.entries(itemBreakdowns)
                .sort(
                  (a, b) =>
                    (b[1].totalBaseCosts.sulfur ?? 0) -
                    (a[1].totalBaseCosts.sulfur ?? 0),
                )
                .map(([itemShortName, breakdown]) => {
                  const item = getItemDetails(itemShortName);
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
                        <div className="space-y-3">
                          {/* Crafting tree */}
                          <div className="overflow-auto rounded-md border bg-muted/20 p-0">
                            <div className="border-b bg-muted px-3 py-2">
                              <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Crafting Requirements
                              </h4>
                            </div>
                            <div className="space-y-1.5 p-3">
                              {breakdown.craftingTree
                                .sort((a, b) => b.amount - a.amount)
                                .map((node, index) => (
                                  <CraftingTreeNode key={index} node={node} />
                                ))}
                            </div>
                          </div>

                          {/* Base resources summary for this item */}
                          <div className="overflow-auto rounded-md border bg-muted/20 p-0">
                            <div className="border-b bg-muted px-3 py-2">
                              <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Base Resources
                              </h4>
                            </div>
                            <div className="space-y-1.5 p-3">
                              {Object.entries(breakdown.totalBaseCosts)
                                .sort((a, b) => b[1] - a[1])
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
                })}
            </Accordion>
          </div>

          {/* Total resources */}
          <div className="md:w-1/2 xl:w-2/3">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              Total Base Resources
              <Badge variant="outline" className="ml-1">
                All Items
              </Badge>
            </h3>
            <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {Object.entries(totalResources)
                .sort((a, b) => b[1] - a[1])
                .map(([resourceName, amount]) => {
                  const itemDetails = getItemDetails(resourceName);
                  const isSulfur = resourceName === "sulfur";
                  const isMetal = resourceName === "metal.fragments";
                  const isLowGrade = resourceName === "lowgradefuel";

                  const sulfurNodesRequired = isSulfur
                    ? Math.ceil(amount / 300)
                    : null;
                  const metalNodesRequired = isMetal
                    ? Math.ceil(amount / 600)
                    : null;
                  const crudeOilRequired = isLowGrade
                    ? Math.ceil(amount / 3)
                    : null;

                  return (
                    <div
                      key={resourceName}
                      className="flex items-center gap-2 rounded-md border bg-muted/20 p-2"
                    >
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                          src={`https://cdn.rusthelp.com/images/public/128/${resourceName}.png`}
                          alt={itemDetails?.displayName || resourceName}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {itemDetails?.displayName || resourceName}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                          {amount.toLocaleString()}
                          {isSulfur && (
                            <span className="text-xs">
                              ({sulfurNodesRequired} node
                              {sulfurNodesRequired !== 1 ? "s" : ""})
                            </span>
                          )}
                          {isMetal && (
                            <span className="text-xs">
                              ({metalNodesRequired} node
                              {metalNodesRequired !== 1 ? "s" : ""})
                            </span>
                          )}
                          {isLowGrade && (
                            <span className="text-xs">
                              ({crudeOilRequired} crude oil)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center text-balance outline outline-border">
          <p className="text-lg font-medium text-muted-foreground">
            Select some items to get started
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            The cost breakdown will appear here
          </p>
        </div>
      )}
    </div>
  );
}
