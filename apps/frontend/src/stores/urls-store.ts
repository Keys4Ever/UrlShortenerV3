import { create } from "zustand";
import { ApiError } from "@/lib/api/client";
import { fetchUrlStats, listUrls } from "@/lib/api/urls-api";
import type { UrlItem, UrlStats } from "@/lib/api/types";
import { useTagsStore } from "@/stores/tags-store";

interface UrlsState {
  urls: UrlItem[];
  total: number;
  listLoading: boolean;
  listError: string | null;
  statsByUrlId: Record<number, UrlStats>;
  aggregateClicks24h: number;
  reset: () => void;
  loadDashboard: (accessToken: string) => Promise<void>;
}

export const useUrlsStore = create<UrlsState>((set) => ({
  urls: [],
  total: 0,
  listLoading: false,
  listError: null,
  statsByUrlId: {},
  aggregateClicks24h: 0,

  reset: () =>
    set({
      urls: [],
      total: 0,
      listLoading: false,
      listError: null,
      statsByUrlId: {},
      aggregateClicks24h: 0,
    }),

  loadDashboard: async (accessToken: string) => {
    set({ listLoading: true, listError: null });
    try {
      const { urls, total } = await listUrls(accessToken, 0, 50);
      useTagsStore.getState().ingestFromUrlItems(urls);
      set({ urls, total, listLoading: false, listError: null });

      const results = await Promise.allSettled(
        urls.map((u) => fetchUrlStats(accessToken, u.id).then((stats) => [u.id, stats] as const)),
      );

      const statsByUrlId: Record<number, UrlStats> = {};
      let aggregateClicks24h = 0;
      for (const r of results) {
        if (r.status === "fulfilled") {
          const [id, stats] = r.value;
          statsByUrlId[id] = stats;
          aggregateClicks24h += stats.clicksLast24h;
        }
      }
      set({ statsByUrlId, aggregateClicks24h });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not load links";
      set({ listError: message, listLoading: false });
    }
  },
}));
