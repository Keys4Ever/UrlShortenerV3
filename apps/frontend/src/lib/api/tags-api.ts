import { unwrapData } from "./client";

export interface TagRecord {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
}

export async function searchTags(q: string, limit = 24): Promise<TagRecord[]> {
  const query = q.trim();
  if (!query) return [];
  return unwrapData<TagRecord[]>(`/api/tags/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
    method: "GET",
  });
}
