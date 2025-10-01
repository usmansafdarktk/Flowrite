import axios, { AxiosResponse, AxiosError } from "axios";

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
});
