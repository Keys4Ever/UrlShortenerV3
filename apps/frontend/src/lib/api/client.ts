import type { ApiSuccess } from "./types";

function getBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type JsonRecord = Record<string, unknown>;

function extractMessage(json: JsonRecord, status: number): string {
  const msg = json.message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof json.error === "string") return json.error;
  return `Request failed (${status})`;
}

export async function apiFetchJson<T>(
  path: string,
  init: RequestInit & { accessToken?: string | null } = {},
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const headers = new Headers(init.headers);

  if (
    init.body !== undefined &&
    typeof init.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const token = init.accessToken;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const { accessToken: _a, ...rest } = init;
  const res = await fetch(url, { ...rest, headers });

  let json: JsonRecord = {};
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text) as JsonRecord;
    } catch {
      throw new ApiError(text || res.statusText, res.status);
    }
  }

  if (!res.ok) {
    throw new ApiError(extractMessage(json, res.status), res.status);
  }

  if (json.success === false) {
    throw new ApiError(extractMessage(json, res.status), res.status);
  }

  return json as T;
}

export async function unwrapData<R>(path: string, init?: RequestInit & { accessToken?: string | null }): Promise<R> {
  const json = await apiFetchJson<ApiSuccess<R>>(path, init);
  return json.data;
}
