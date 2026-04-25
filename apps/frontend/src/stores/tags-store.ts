import { create } from "zustand";
import { listUrls } from "@/lib/api/urls-api";
import { searchTags } from "@/lib/api/tags-api";
import type { UrlItem } from "@/lib/api/types";

function uniqueSorted(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of names) {
    const n = raw.trim();
    if (!n) continue;
    const key = n.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return out;
}

function namesFromUrls(urls: UrlItem[]): string[] {
  return uniqueSorted(urls.flatMap((u) => u.tags ?? []));
}

interface TagsState {
  knownTags: string[];
  catalogMatches: { id: number; name: string }[];
  catalogLoading: boolean;
  ingestFromUrlItems: (urls: UrlItem[]) => void;
  addKnownFromNames: (names: string[]) => void;
  hydrateKnownTags: (accessToken: string) => Promise<void>;
  searchCatalog: (q: string) => Promise<void>;
  reset: () => void;
}

let catalogSearchSeq = 0;

export const useTagsStore = create<TagsState>((set, get) => ({
  knownTags: [],
  catalogMatches: [],
  catalogLoading: false,

  ingestFromUrlItems: (urls) => {
    set({ knownTags: namesFromUrls(urls) });
  },

  addKnownFromNames: (names) => {
    set({ knownTags: uniqueSorted([...get().knownTags, ...names]) });
  },

  hydrateKnownTags: async (accessToken: string) => {
    try {
      const { urls } = await listUrls(accessToken, 0, 100);
      set({ knownTags: namesFromUrls(urls) });
    } catch {}
  },

  searchCatalog: async (q) => {
    const trimmed = q.trim();
    if (!trimmed) {
      set({ catalogMatches: [], catalogLoading: false });
      return;
    }
    const seq = ++catalogSearchSeq;
    set({ catalogLoading: true });
    try {
      const tags = await searchTags(trimmed, 24);
      if (seq !== catalogSearchSeq) return;
      set({
        catalogMatches: tags.map((t) => ({ id: t.id, name: t.name })),
        catalogLoading: false,
      });
    } catch {
      if (seq !== catalogSearchSeq) return;
      set({ catalogMatches: [], catalogLoading: false });
    }
  },

  reset: () => set({ knownTags: [], catalogMatches: [], catalogLoading: false }),
}));
