import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as authApi from "@/lib/api/auth-api";
import { ApiError } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { useUrlsStore } from "./urls-store";
import { useTagsStore } from "./tags-store";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string, pfp: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      fetchProfile: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          const user = await authApi.fetchProfile(token);
          set({ user });
        } catch {
          set({ accessToken: null, user: null });
          useUrlsStore.getState().reset();
          useTagsStore.getState().reset();
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { access_token } = await authApi.loginRequest(email, password);
          set({ accessToken: access_token });
          const user = await authApi.fetchProfile(access_token);
          set({ user, isLoading: false });
        } catch (err) {
          const message = err instanceof ApiError ? err.message : "Login failed";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (email: string, password: string, nickname: string, pfp: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.registerRequest(email, password, nickname, pfp);
          await get().login(email, password);
        } catch (err) {
          const message = err instanceof ApiError ? err.message : "Registration failed";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: () => {
        set({ accessToken: null, user: null, error: null });
        useUrlsStore.getState().reset();
        useTagsStore.getState().reset();
      },
    }),
    {
      name: "url-shortener-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
);
