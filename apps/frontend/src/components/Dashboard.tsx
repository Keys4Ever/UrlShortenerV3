import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUrlsStore } from "@/stores/urls-store";
import type { UrlItem, UrlStats } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";
import { DashboardMainPanel } from "./DashboardMainPanel";
import { DashboardShell } from "./DashboardShell";
import { DashboardSidePanel } from "./DashboardSidePanel";
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";
import { DashboardStatsHeader } from "./DashboardStatsHeader";
import { DashboardFiltersBar } from "./DashboardFiltersBar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const { user } = useAuth();
  const accessToken = useAuthStore((s) => s.accessToken);
  const urls = useUrlsStore((s) => s.urls);
  const total = useUrlsStore((s) => s.total);
  const listLoading = useUrlsStore((s) => s.listLoading);
  const listError = useUrlsStore((s) => s.listError);
  const statsByUrlId = useUrlsStore((s) => s.statsByUrlId);
  const aggregateClicks24h = useUrlsStore((s) => s.aggregateClicks24h);
  const loadDashboard = useUrlsStore((s) => s.loadDashboard);

  const [selectedUrl, setSelectedUrl] = useState<UrlItem | null>(null);
  const [sideOpen, setSideOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );
  const isMobile = useIsMobile();

  const mobileDetailOpen = isMobile && selectedUrl !== null;
  const effectiveSideOpen = sideOpen || mobileDetailOpen;

  useEffect(() => {
    if (user && accessToken) {
      void loadDashboard(accessToken);
    }
  }, [user, accessToken, loadDashboard]);

  useEffect(() => {
    setSelectedUrl((prev) => {
      if (!prev) return null;
      return urls.find((u) => u.id === prev.id) ?? null;
    });
  }, [urls]);

  const {
    search,
    setSearch,
    selectedTag,
    setSelectedTag,
    availableTags,
    filteredUrls,
    hasActiveFilters,
  } = useDashboardFilters(urls);

  useEffect(() => {
    setSelectedUrl((prev) => {
      if (!prev) return null;
      return filteredUrls.some((u) => u.id === prev.id) ? prev : null;
    });
  }, [filteredUrls]);

  const totalClicks = urls.reduce((s, u) => s + u.clickCount, 0);
  const panelStats: UrlStats | null = selectedUrl ? statsByUrlId[selectedUrl.id] ?? null : null;

  const handleSelectUrl = (url: UrlItem) => {
    if (selectedUrl?.id === url.id) {
      setSelectedUrl(null);
    } else {
      setSelectedUrl(url);
      setSideOpen(true);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 font-mono text-sm text-muted-foreground">
        Sign in to view your dashboard.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <DashboardStatsHeader
        listLoading={listLoading}
        total={total}
        totalClicks={totalClicks}
        aggregateClicks24h={aggregateClicks24h}
      />

      {listError && (
        <div className="border-b border-border px-safe py-2 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))] font-mono text-xs text-destructive bg-destructive/10">
          {listError}
        </div>
      )}

      <DashboardFiltersBar
        search={search}
        selectedTag={selectedTag}
        availableTags={availableTags}
        onSearchChange={setSearch}
        onTagChange={setSelectedTag}
      />

      <DashboardShell
        sideOpen={effectiveSideOpen}
        onSideOpenChange={setSideOpen}
        hideMain={mobileDetailOpen}
        main={
          <DashboardMainPanel
            urls={filteredUrls}
            listLoading={listLoading}
            selectedUrl={selectedUrl}
            onSelectUrl={handleSelectUrl}
            hasActiveFilters={hasActiveFilters}
          />
        }
        side={
          <DashboardSidePanel
            selectedUrl={selectedUrl}
            panelStats={panelStats}
            onClearSelection={() => setSelectedUrl(null)}
            onCollapseSide={() => {
              setSideOpen(false);
              if (isMobile) setSelectedUrl(null);
            }}
            onUrlSaved={() => {
              if (accessToken) void loadDashboard(accessToken);
            }}
          />
        }
      />
    </div>
  );
}
