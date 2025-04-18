import { CraftingNode } from "@/types/calculator";
import { memo } from "react";
import { ResourceDisplay } from "./resource-display";

interface CraftingTreeNodeProps {
  node: CraftingNode;
  depth?: number;
}

const CraftingTreeNode = memo(({ node, depth = 0 }: CraftingTreeNodeProps) => {
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
                <CraftingTreeNode key={index} node={child} depth={depth + 1} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
});
// This is needed for React DevTools to display the component name correctly
// when using memo() instead of showing "Anonymous Component"
CraftingTreeNode.displayName = "CraftingTreeNode";

export { CraftingTreeNode };
