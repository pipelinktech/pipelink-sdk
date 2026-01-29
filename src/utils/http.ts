/**
 * HTTP Client utilities
 */

import { HTTPError, NetworkError } from "../errors/sdk-error.js";
import { HttpRequestOptions } from "../types/index.js";
import { withTimeout } from "./timeout.js";

/**
 * Performs an HTTP request with error handling and timeout
 */
export async function httpRequest<T>(
  url: string,
  options: HttpRequestOptions & { fetch?: typeof fetch; timeout: number }
): Promise<T> {
  const { method = "GET", headers = {}, body, timeout, fetch: customFetch } = options;

  // Use injected fetch or global fetch
  const fetchFn = customFetch || globalThis.fetch;

  const requestInit: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
  }

  try {
    const response = await withTimeout(
      fetchFn(url, requestInit),
      timeout
    );

    const contentType = response.headers.get("content-type");
    let data: unknown = undefined;

    // Parse JSON if content-type indicates JSON
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else if (response.ok) {
      // For successful non-JSON responses, try to parse as text
      data = await response.text();
    }

    // Handle HTTP errors
    if (!response.ok) {
      throw new HTTPError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response.statusText,
        data
      );
    }

    return data as T;
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof HTTPError || error instanceof NetworkError) {
      throw error;
    }

    // Handle fetch errors (network issues, etc.)
    if (error instanceof TypeError) {
      throw new NetworkError(
        `Network request failed: ${error.message}`,
        error
      );
    }

    // Re-throw unknown errors
    throw error;
  }
}

/**
 * Performs a GET request
 */
export async function get<T>(
  url: string,
  options: Omit<HttpRequestOptions, "method" | "body"> & {
    fetch?: typeof fetch;
    timeout: number;
  }
): Promise<T> {
  return httpRequest<T>(url, { ...options, method: "GET" });
}

/**
 * Performs a POST request
 */
export async function post<T>(
  url: string,
  body: unknown,
  options: Omit<HttpRequestOptions, "method" | "body"> & {
    fetch?: typeof fetch;
    timeout: number;
  }
): Promise<T> {
  return httpRequest<T>(url, { ...options, method: "POST", body });
}
