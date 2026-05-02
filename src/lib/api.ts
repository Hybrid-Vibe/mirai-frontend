/**
 * Centralized API configuration for MIRAI.
 * Connects to the .NET backend.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5236";

/**
 * Standard fetch options for backend requests
 */
export const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/**
 * Helper to build full API URLs for the backend
 */
export function getBackendUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
}
