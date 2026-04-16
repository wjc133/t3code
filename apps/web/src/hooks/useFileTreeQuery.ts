import { useQuery } from "@tanstack/react-query";
import type { EnvironmentId } from "@t3tools/contracts";
import { readEnvironmentApi } from "~/environmentApi";

export interface FileTreeNode {
  name: string;
  path: string;
  kind: "file" | "directory";
}

interface FileTreeQueryOptions {
  environmentId: EnvironmentId | null;
  cwd: string | null;
  enabled?: boolean;
}

export function useFileTreeQuery(options: FileTreeQueryOptions) {
  const { environmentId, cwd, enabled = true } = options;

  return useQuery({
    queryKey: ["fileTree", "browse", environmentId, cwd],
    queryFn: async (): Promise<FileTreeNode[]> => {
      if (!environmentId || !cwd) {
        return [];
      }

      const api = readEnvironmentApi(environmentId);
      if (!api) {
        throw new Error(`Environment API not found for ${environmentId}`);
      }

      const result = await api.filesystem.browse({
        partialPath: cwd,
      });

      const nodes = result.entries.map((entry) => ({
        name: entry.name,
        path: entry.fullPath,
        kind: entry.kind,
      }));

      return nodes.sort((a, b) => {
        if (a.kind !== b.kind) {
          return a.kind === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
    },
    enabled: enabled && !!environmentId && !!cwd,
    staleTime: 15_000,
    gcTime: 60_000,
  });
}

export function useDirectoryContentQuery(options: {
  environmentId: EnvironmentId | null;
  directoryPath: string | null;
  enabled?: boolean;
}) {
  const { environmentId, directoryPath, enabled = true } = options;

  return useQuery({
    queryKey: ["fileTree", "directory", environmentId, directoryPath],
    queryFn: async (): Promise<FileTreeNode[]> => {
      if (!environmentId || !directoryPath) {
        return [];
      }

      const api = readEnvironmentApi(environmentId);
      if (!api) {
        throw new Error(`Environment API not found for ${environmentId}`);
      }

      const result = await api.filesystem.browse({
        partialPath: directoryPath,
      });

      // Sort: directories first, then files, both alphabetically
      const nodes = result.entries.map((entry) => ({
        name: entry.name,
        path: entry.fullPath,
        kind: entry.kind,
      }));

      return nodes.sort((a, b) => {
        if (a.kind !== b.kind) {
          return a.kind === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
    },
    enabled: enabled && !!environmentId && !!directoryPath,
    staleTime: 15_000,
    gcTime: 60_000,
  });
}
