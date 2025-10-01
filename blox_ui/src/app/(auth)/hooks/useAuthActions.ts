"use client";

import { useApiClient } from "@/lib/api/useApiClient";
import { useAuthStore } from "@/stores/authStore";

export function useAuthActions() {
  const client = useApiClient();
  const { signup, login, logout } = useAuthStore();

  return {
    signup: (data: { username: string; email: string; password: string }) => signup(client, data),
    login: (data: { email: string; password: string }) => login(client, data),
    logout: () => logout(client),
  };
}
