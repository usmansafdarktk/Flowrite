"use client";

import { useRouter } from "next/navigation";
import { useEffect, startTransition } from "react";
import type { AxiosError, AxiosResponse } from "axios";
import { apiClient } from "./apiClient";
import { showErrorToast } from "@/components/ui/ToastWrapper";
import { ApiErrorResponse } from "./apiClient";
import { useAuthStore } from "@/src/stores/authStore";

export function useApiClient() {
  const router = useRouter();
  const setUnauthorized = useAuthStore((set) => set.setUnauthorized);

  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        const status = error.response?.status;
        const msg =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "An unexpected error occurred.";

        if (status === 401) {
          showErrorToast(undefined, msg);
          console.log("401 error, redirecting to signin");
          setUnauthorized(true);
          // startTransition(() => {
          //   router.push("/signin");
          // });
          // window.location.assign("/signin");
        } else {
          showErrorToast(undefined, msg);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, [router]);

  return apiClient;
}
