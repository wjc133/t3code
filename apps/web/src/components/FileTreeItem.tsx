import { memo, useCallback } from "react";
import { ChevronRightIcon, FolderIcon, FolderClosedIcon } from "lucide-react";
import type { EnvironmentId } from "@t3tools/contracts";
import { VscodeEntryIcon } from "./chat/VscodeEntryIcon";
import { cn } from "~/lib/utils";
import { readLocalApi } from "~/localApi";
import { useDirectoryContentQuery, type FileTreeNode } from "~/hooks/useFileTreeQuery";
import { useTheme } from "~/hooks/useTheme";

interface FileTreeItemProps {
  node: FileTreeNode;
  environmentId: EnvironmentId;
  depth: number;
  expandedDirs: Set<string>;
  onToggleDir: (path: string) => void;
  onFilePreview: (filePath: string) => void;
  onAddFileToComposer: (filePath: string) => void;
}

export const FileTreeItem = memo(function FileTreeItem({
  node,
  environmentId,
  depth,
  expandedDirs,
  onToggleDir,
  onFilePreview,
  onAddFileToComposer,
}: FileTreeItemProps) {
  const { resolvedTheme } = useTheme();

  const isDirectory = node.kind === "directory";
  const isExpanded = expandedDirs.has(node.path);
  const leftPadding = 8 + depth * 14;

  const { data: children = [], isLoading } = useDirectoryContentQuery({
    environmentId,
    directoryPath: isDirectory && isExpanded ? node.path : null,
    enabled: isDirectory && isExpanded,
  });

  const handleClick = useCallback(() => {
    if (isDirectory) {
      onToggleDir(node.path);
    }
  }, [isDirectory, node.path, onToggleDir]);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (isDirectory) return;

      const api = readLocalApi();
      if (!api) return;

      api.contextMenu.show(
        [
          { id: "preview", label: "Preview file content" },
          { id: "add-to-chat", label: "Add to chat" },
        ] as const,
        { x: event.clientX, y: event.clientY },
      ).then((clicked) => {
        if (clicked === "preview") {
          onFilePreview(node.path);
        } else if (clicked === "add-to-chat") {
          onAddFileToComposer(node.path);
        }
      });
    },
    [isDirectory, node.path, onFilePreview, onAddFileToComposer],
  );

  return (
    <div className="file-tree-item">
      <button
        type="button"
        data-scroll-anchor-ignore
        aria-expanded={isDirectory ? isExpanded : undefined}
        className="group flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left hover:bg-background/80"
        style={{ paddingLeft: `${leftPadding}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {isDirectory ? (
          <>
            <ChevronRightIcon
              aria-hidden="true"
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground/70 transition-transform group-hover:text-foreground/80",
                isExpanded && "rotate-90",
              )}
            />
            {isExpanded ? (
              <FolderIcon className="size-3.5 shrink-0 text-muted-foreground/75" />
            ) : (
              <FolderClosedIcon className="size-3.5 shrink-0 text-muted-foreground/75" />
            )}
          </>
        ) : (
          <span aria-hidden="true" className="size-3.5 shrink-0" />
        )}
        {!isDirectory && (
          <VscodeEntryIcon
            pathValue={node.path}
            kind="file"
            theme={resolvedTheme}
            className="size-3.5 text-muted-foreground/70"
          />
        )}
        <span className="truncate font-mono text-[11px] text-muted-foreground/90 group-hover:text-foreground/90">
          {node.name}
        </span>
      </button>

      {isDirectory && isExpanded && (
        <div className="file-tree-children">
          {isLoading ? (
            <div
              className="py-1 text-[10px] text-muted-foreground/60"
              style={{ paddingLeft: `${leftPadding + 14}px` }}
            >
              Loading...
            </div>
          ) : (
            children.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                environmentId={environmentId}
                depth={depth + 1}
                expandedDirs={expandedDirs}
                onToggleDir={onToggleDir}
                onFilePreview={onFilePreview}
                onAddFileToComposer={onAddFileToComposer}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
});
