import type { ReactNode } from "react";

import { isElectron } from "~/env";
import { cn } from "~/lib/utils";

export function FileTreePanelShell(props: {
  header: ReactNode;
  children: ReactNode;
}) {
  const shouldUseDragRegion = isElectron;

  return (
    <div className="flex h-full min-w-0 flex-col bg-background w-[42vw] min-w-[360px] max-w-[560px] shrink-0 border-l border-border">
      {shouldUseDragRegion ? (
        <div
          className={cn(
            "flex items-center justify-between gap-2 px-4 drag-region h-[52px] border-b border-border wco:pr-[calc(100vw-env(titlebar-area-width)-env(titlebar-area-x)+1em)] wco:h-[env(titlebar-area-height)]",
          )}
        >
          {props.header}
        </div>
      ) : (
        <div className="border-b border-border">
          <div
            className={cn(
              "flex items-center justify-between gap-2 px-4 h-12 wco:max-h-[env(titlebar-area-height)] wco:pr-[calc(100vw-env(titlebar-area-width)-env(titlebar-area-x)+1em)]",
            )}
          >
            {props.header}
          </div>
        </div>
      )}
      {props.children}
    </div>
  );
}
