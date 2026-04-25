import { useMemo, useState } from "react";
import type { UrlItem } from "@/lib/api/types";

export function useDashboardFilters(urls: UrlItem[]) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    urls.forEach((url) => url.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  }, [urls]);

  const filteredUrls = useMemo(() => {
    const q = search.trim().toLowerCase();
    return urls.filter((url) => {
      if (
        selectedTag !== "all" &&
        !url.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      ) {
        return false;
      }

      if (!q) return true;

      const haystack = [
        url.shortCode,
        url.originalUrl,
        url.title ?? "",
        url.description ?? "",
        ...url.tags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [urls, search, selectedTag]);

  const hasActiveFilters = search.trim().length > 0 || selectedTag !== "all";

  return {
    search,
    setSearch,
    selectedTag,
    setSelectedTag,
    availableTags,
    filteredUrls,
    hasActiveFilters,
  };
}
