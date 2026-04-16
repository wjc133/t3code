import { memo, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EnvironmentId } from "@t3tools/contracts";
import { ArrowLeftIcon, FileIcon, Loader2Icon } from "lucide-react";
import { File, type FileContents, type SupportedLanguages } from "@pierre/diffs/react";
import { readEnvironmentApi } from "~/environmentApi";
import { detectLanguageFromPath, isBinaryFile, isImageFile } from "~/lib/languageDetection";
import { useTheme } from "~/hooks/useTheme";
import { resolveDiffThemeName } from "~/lib/diffRendering";
import { Button } from "./ui/button";

interface FilePreviewPanelProps {
  environmentId: EnvironmentId;
  filePath: string;
  projectCwd: string;
  onClose: () => void;
}

export const FilePreviewPanel = memo(function FilePreviewPanel({
  environmentId,
  filePath,
  projectCwd,
  onClose,
}: FilePreviewPanelProps) {
  const { resolvedTheme } = useTheme();
  const language = useMemo(() => detectLanguageFromPath(filePath), [filePath]);
  const fileName = useMemo(() => filePath.split("/").pop() ?? filePath, [filePath]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["filePreview", environmentId, filePath],
    queryFn: async () => {
      const api = readEnvironmentApi(environmentId);
      if (!api) {
        throw new Error(`Environment API not found for ${environmentId}`);
      }

      const result = await api.filesystem.read({
        path: filePath,
        cwd: projectCwd,
      });

      return result;
    },
    enabled: !!filePath,
    staleTime: 30_000,
  });

  const isBinary = useMemo(() => {
    if (!data) return false;
    return isBinaryFile(data.mimeType);
  }, [data]);

  const isImage = useMemo(() => isImageFile(filePath), [filePath]);

  const diffThemeName = useMemo(() => resolveDiffThemeName(resolvedTheme), [resolvedTheme]);

  const fileContents = useMemo<FileContents | undefined>(() => {
    if (!data) return undefined;
    return {
      name: fileName,
      contents: data.content,
      lang: language as SupportedLanguages,
    };
  }, [data, fileName, language]);

  // Keyboard handler for escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const header = (
    <>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onClose}
          className="shrink-0"
        >
          <ArrowLeftIcon className="size-3.5" />
        </Button>
        <FileIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-mono truncate" title={filePath}>
          {fileName}
        </span>
      </div>
    </>
  );

  return (
    <div className="flex h-full min-w-0 flex-col bg-background w-[42vw] min-w-[360px] max-w-[560px] shrink-0 border-l border-border">
      <div className="flex items-center justify-between gap-2 px-4 h-12 border-b border-border">
        {header}
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-xs gap-2">
            <Loader2Icon className="size-4 animate-spin" />
            Loading file...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground text-xs p-4 text-center">
            <span>Failed to load file</span>
            <span className="text-destructive/80">
              {error instanceof Error ? error.message : "Unknown error"}
            </span>
          </div>
        ) : isImage ? (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={`file://${filePath}`}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : isBinary ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-xs">
            Binary file - cannot preview
          </div>
        ) : fileContents ? (
          <div className="p-2">
            <File
              file={fileContents}
              options={{
                theme: { dark: diffThemeName, light: diffThemeName },
                disableFileHeader: true,
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
});
