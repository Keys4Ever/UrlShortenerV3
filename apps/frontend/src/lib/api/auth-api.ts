import { unwrapData } from "./client";
import type { User } from "./types";

export async function loginRequest(email: string, password: string): Promise<{ access_token: string }> {
  return unwrapData<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(
  email: string,
  password: string,
  nickname: string,
  pfp: string,
): Promise<User> {
  const body: Record<string, string> = { email, password, nickname };
  const trimmed = pfp.trim();
  if (trimmed) body.pfp = trimmed;
  return unwrapData<User>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchProfile(accessToken: string): Promise<User> {
  return unwrapData<User>("/api/auth/profile", {
    method: "GET",
    accessToken,
  });
}
