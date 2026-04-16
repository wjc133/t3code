import { memo, useCallback, useState } from "react";
import type { EnvironmentId } from "@t3tools/contracts";
import { FolderTreeIcon, RefreshCwIcon } from "lucide-react";
import { useFileTreeQuery } from "~/hooks/useFileTreeQuery";
import { FileTreeItem } from "./FileTreeItem";
import { FileTreePanelShell } from "./FileTreePanelShell";

interface FileTreePanelProps {
  environmentId: EnvironmentId;
  projectCwd: string;
  projectName: string | undefined;
  worktreePath: string | null;
  onFilePreview: (filePath: string) => void;
  onAddFileToComposer: (filePath: string) => void;
}

export const FileTreePanel = memo(function FileTreePanel({
  environmentId,
  projectCwd,
  projectName,
  worktreePath,
  onFilePreview,
  onAddFileToComposer,
}: FileTreePanelProps) {
  const effectiveCwd = worktreePath ?? projectCwd;
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  const { data: rootNodes = [], isLoading, isError, refetch } = useFileTreeQuery({
    environmentId,
    cwd: effectiveCwd,
  });

  const handleToggleDir = useCallback((path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const header = (
    <>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <FolderTreeIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium truncate">
          {projectName ?? "Files"}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => refetch()}
          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          title="Refresh"
        >
          <RefreshCwIcon className="size-3.5" />
        </button>
      </div>
    </>
  );

  return (
    <FileTreePanelShell header={header}>
      <div className="flex-1 min-h-0 overflow-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
            Loading file tree...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground text-xs">
            <span>Failed to load file tree</span>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : rootNodes.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
            No files found
          </div>
        ) : (
          <div className="space-y-0.5">
            {rootNodes.map((node) => (
              <FileTreeItem
                key={node.path}
                node={node}
                environmentId={environmentId}
                depth={0}
                expandedDirs={expandedDirs}
                onToggleDir={handleToggleDir}
                onFilePreview={onFilePreview}
                onAddFileToComposer={onAddFileToComposer}
              />
            ))}
          </div>
        )}
      </div>
    </FileTreePanelShell>
  );
});
