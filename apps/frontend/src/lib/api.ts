import { API_URL } from "./constants";
import { useAuthStore } from "../store/authStore";
import { ApiError, type ApiResponse } from "../types/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const error = payload.success
      ? { code: "REQUEST_FAILED", message: "Noe gikk galt. Prøv igjen." }
      : payload.error;

    if (response.status === 401) {
      useAuthStore.getState().clearAuth();
    }

    throw new ApiError(error.message, error.code, response.status);
  }

  return payload.data;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return apiRequest<T>(path);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return apiRequest<T>(path, { method: "POST", body });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return apiRequest<T>(path, { method: "PATCH", body });
  },
  delete<T>(path: string): Promise<T> {
    return apiRequest<T>(path, { method: "DELETE" });
  }
};
