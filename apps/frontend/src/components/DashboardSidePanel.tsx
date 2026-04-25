import type { UrlItem, UrlStats } from "@/lib/api/types";
import StatsPanel from "./StatsPanel";
import UrlShortener from "./UrlShortener";
import { DashboardSideTtyBar } from "./DashboardSideSlot";
import { DashboardChangelog } from "./DashboardChangelog";

export type DashboardSidePanelProps = {
  selectedUrl: UrlItem | null;
  panelStats: UrlStats | null;
  onClearSelection: () => void;
  onCollapseSide: () => void;
  onUrlSaved: () => void;
};

export function DashboardSidePanel({
  selectedUrl,
  panelStats,
  onClearSelection,
  onCollapseSide,
  onUrlSaved,
}: DashboardSidePanelProps) {
  if (selectedUrl && panelStats) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <StatsPanel
          embedded
          url={selectedUrl}
          stats={panelStats}
          onClose={onClearSelection}
          onHideSide={onCollapseSide}
          onUrlSaved={onUrlSaved}
        />
      </div>
    );
  }

  if (selectedUrl) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <DashboardSideTtyBar onCollapse={onCollapseSide} />
        <div className="space-y-4 p-4 font-mono text-xs text-muted-foreground">
          <p>
            Could not load stats for <span className="text-neon">/{selectedUrl.shortCode}</span>.
          </p>
          <button
            type="button"
            onClick={onClearSelection}
            className="min-h-[44px] border border-border px-3 py-2 text-foreground transition-interact hover:border-foreground focus-ring-terminal"
          >
            Back to shorten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardSideTtyBar onCollapse={onCollapseSide} />
      <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-safe">
        <UrlShortener variant="embed" />
        <DashboardChangelog />
      </div>
    </div>
  );
}
