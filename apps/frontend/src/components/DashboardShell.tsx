import type { ReactNode } from "react";
import { DashboardSideSlot } from "./DashboardSideSlot";
import { cn } from "@/lib/utils";

export type DashboardShellProps = {
  sideOpen: boolean;
  onSideOpenChange: (open: boolean) => void;
  main: ReactNode;
  side: ReactNode;
};

export function DashboardShell({ sideOpen, onSideOpenChange, main, side }: DashboardShellProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <div
        className={cn(
          "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-auto",
          sideOpen && "md:border-r md:border-border",
        )}
      >
        {main}
        {!sideOpen && (
          <button
            type="button"
            onClick={() => onSideOpenChange(true)}
            aria-label="Open side panel"
            className={cn(
              "z-10 border border-border bg-surface font-mono text-[11px] text-muted-foreground shadow-[0_0_20px_hsl(0_0%_0%/0.35)] transition-interact",
              "hover:border-foreground hover:text-foreground focus-ring-terminal",
              "fixed left-1/2 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-center py-2.5",
              "bottom-[max(1rem,env(safe-area-inset-bottom,0px))] md:absolute md:inset-x-auto md:bottom-auto md:left-auto md:right-0 md:top-1/2 md:w-9 md:max-w-none md:translate-x-0 md:-translate-y-1/2 md:px-0 md:py-8 md:shadow-none md:[writing-mode:vertical-rl]",
            )}
          >
            ›
          </button>
        )}
      </div>
      {sideOpen ? <DashboardSideSlot>{side}</DashboardSideSlot> : null}
    </div>
  );
}
