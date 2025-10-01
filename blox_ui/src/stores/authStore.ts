// store/useAuthStore.ts
import { create } from "zustand";
import type { User } from "../types/auth";
import type { AxiosInstance } from "axios";

interface AuthResponse {
  data: User | null;
  message: string;
  error?: string;
}

interface AuthState {
  user: User | null;
  unauthorized: boolean;
  loading: boolean;
  signupData: AuthResponse | null;
  loginData: AuthResponse | null;
  signup: (
    client: AxiosInstance,
    data: { username: string; email: string; password: string }
  ) => Promise<AuthResponse | null>;
  login: (
    client: AxiosInstance,
    data: { email: string; password: string }
  ) => Promise<AuthResponse | null>;
  logout: (client: AxiosInstance) => Promise<void>;
  setUnauthorized: (unauthorized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  signupData: null,
  loginData: null,
  unauthorized: false,

  setUnauthorized: (unauthorized: boolean) => set({ unauthorized }),

  signup: async (client, data) => {
    try {
      set({ loading: true, signupData: null });
      const res = await client.post("/signup", data);

      const response: AuthResponse = {
        data: res.data.data || null,
        message: res.data.message || "Signup successful",
      };

      set({ signupData: response });
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Signup failed";
      set({
        signupData: {
          data: null,
          message: "Signup failed",
          error: errorMsg,
        },
      });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  login: async (client, data) => {
    try {
      set({ loading: true, loginData: null });
      const res = await client.post("/login", data);

      const response: AuthResponse = {
        data: res.data.data || null,
        message: res.data.message || "Login successful",
      };

      set({ user: response.data, loginData: response });
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Login failed";
      set({
        loginData: {
          data: null,
          message: "Login failed",
          error: errorMsg,
        },
      });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  logout: async (client) => {
    try {
      await client.post("/logout");
    } catch {
      // ignore errors
    } finally {
      set({ user: null, loginData: null, signupData: null });
    }
  },
}));
