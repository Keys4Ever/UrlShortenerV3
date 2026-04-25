import type { KeyboardEvent } from "react";
import type { UrlItem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export type DashboardMainPanelProps = {
  urls: UrlItem[];
  listLoading: boolean;
  selectedUrl: UrlItem | null;
  onSelectUrl: (url: UrlItem) => void;
  hasActiveFilters?: boolean;
};

export function DashboardMainPanel({
  urls,
  listLoading,
  selectedUrl,
  onSelectUrl,
  hasActiveFilters = false,
}: DashboardMainPanelProps) {
  return (
    <div className="min-h-[200px] min-w-0">
      {listLoading && urls.length === 0 ? (
        <div className="p-6 font-mono text-xs text-muted-foreground">Loading links…</div>
      ) : urls.length === 0 ? (
        <div className="p-6 font-mono text-xs text-muted-foreground">
          {hasActiveFilters ? (
            "No links match your filters."
          ) : (
            <>
              No shortened URLs yet.{" "}
              <span className="hidden md:inline">Use the form on the right to create one.</span>
              <span className="md:hidden">Use the form below to create one.</span>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2 border-border/50 px-safe py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] md:hidden sm:px-4">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Links — tap a row; stats open below</p>
            {urls.map((url) => {
              const selected = selectedUrl?.id === url.id;
              const rowActivate = () => onSelectUrl(url);
              return (
                <button
                  key={url.id}
                  type="button"
                  onClick={rowActivate}
                  aria-pressed={selected}
                  aria-label={`View click stats for /${url.shortCode}`}
                  className={cn(
                    "w-full text-left border border-border p-3 min-h-[48px] font-mono transition-interact outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset touch-manipulation active:bg-surface-raised/80",
                    selected ? "bg-surface-raised border-neon/35" : "bg-background hover:bg-surface",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-neon shrink-0">/{url.shortCode}</span>
                    <span className="text-sm text-foreground tabular-nums">{url.clickCount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 break-all line-clamp-2">{url.originalUrl}</p>
                  {(url.description ?? "").trim() ? (
                    <p className="text-[11px] text-muted-foreground/85 mt-1.5 line-clamp-3 leading-snug border-l border-border pl-2">
                      {url.description.trim()}
                    </p>
                  ) : null}
                  {url.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {url.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="font-mono text-[11px] px-1.5 py-0.5 border border-border text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                      {url.tags.length > 4 && (
                        <span className="font-mono text-[10px] text-muted-foreground">+{url.tags.length - 4}</span>
                      )}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground/80 mt-2">
                    {new Date(url.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-3 py-2 sm:px-4 font-mono text-xs text-muted-foreground uppercase tracking-wider font-normal">Code</th>
                  <th className="px-3 py-2 sm:px-4 font-mono text-xs text-muted-foreground uppercase tracking-wider font-normal">Destination</th>
                  <th className="px-3 py-2 sm:px-4 font-mono text-xs text-muted-foreground uppercase tracking-wider font-normal text-right">Clicks</th>
                  <th className="hidden sm:table-cell px-3 py-2 sm:px-4 font-mono text-xs text-muted-foreground uppercase tracking-wider font-normal">Tags</th>
                  <th className="hidden md:table-cell px-3 py-2 sm:px-4 font-mono text-xs text-muted-foreground uppercase tracking-wider font-normal">Created</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => {
                  const selected = selectedUrl?.id === url.id;
                  const rowActivate = () => onSelectUrl(url);
                  const onRowKeyDown = (e: KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      rowActivate();
                    }
                  };
                  return (
                    <tr
                      key={url.id}
                      tabIndex={0}
                      aria-selected={selected}
                      aria-label={`View click stats for /${url.shortCode}`}
                      onClick={rowActivate}
                      onKeyDown={onRowKeyDown}
                      className={`border-b border-border cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                        selected ? "bg-surface-raised" : "hover:bg-surface"
                      }`}
                    >
                      <td className="px-3 py-2.5 sm:px-4">
                        <span className="font-mono text-sm text-neon">/{url.shortCode}</span>
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 max-w-[min(360px,40vw)]">
                        <span className="font-mono text-xs text-muted-foreground truncate block">
                          {url.originalUrl}
                        </span>
                        {(url.description ?? "").trim() ? (
                          <span className="mt-1 block font-mono text-[10px] text-muted-foreground/85 line-clamp-2 leading-snug">
                            {url.description.trim()}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 text-right">
                        <span className="font-mono text-sm text-foreground">{url.clickCount.toLocaleString()}</span>
                      </td>
                      <td className="hidden sm:table-cell px-3 py-2.5 sm:px-4">
                        <div className="flex gap-1 flex-wrap">
                          {url.tags.map((tag) => (
                            <span key={tag} className="font-mono text-xs px-1.5 py-0.5 border border-border text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 py-2.5 sm:px-4">
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(url.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
