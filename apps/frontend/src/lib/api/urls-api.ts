import { unwrapData } from "./client";
import type { AnonymousUrlResult, UrlItem, UrlStats } from "./types";

export async function listUrls(accessToken: string, skip = 0, take = 50): Promise<{ urls: UrlItem[]; total: number }> {
  return unwrapData<{ urls: UrlItem[]; total: number }>(`/api/urls?skip=${skip}&take=${take}`, {
    method: "GET",
    accessToken,
  });
}

export async function fetchUrlStats(accessToken: string, urlId: number): Promise<UrlStats> {
  return unwrapData<UrlStats>(`/api/urls/${urlId}/stats`, {
    method: "GET",
    accessToken,
  });
}

export async function createAuthenticatedUrl(
  accessToken: string,
  body: {
    originalUrl: string;
    customShortCode?: string;
    title?: string;
    description?: string;
    tags?: string[];
  },
): Promise<Pick<UrlItem, "id" | "originalUrl" | "shortCode" | "shortUrl" | "title" | "description" | "createdAt">> {
  return unwrapData(`/api/urls`, {
    method: "POST",
    body: JSON.stringify(body),
    accessToken,
  });
}

export async function createAnonymousUrl(body: {
  originalUrl: string;
  title?: string;
  description?: string;
}): Promise<AnonymousUrlResult> {
  return unwrapData<AnonymousUrlResult>("/api/anonymous/create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type UpdateUrlBody = {
  originalUrl?: string;
  title?: string;
  description?: string;
  tags?: string[];
};

export async function updateUrl(
  accessToken: string,
  urlId: number,
  body: UpdateUrlBody,
): Promise<Pick<UrlItem, "id" | "originalUrl" | "shortCode" | "shortUrl" | "title" | "description" | "tags">> {
  return unwrapData(`/api/urls/${urlId}`, {
    method: "PUT",
    body: JSON.stringify(body),
    accessToken,
  });
}
