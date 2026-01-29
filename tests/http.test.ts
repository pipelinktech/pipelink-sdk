/**
 * HTTP Client tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { httpRequest, get, post } from "../src/utils/http.js";
import { HTTPError, NetworkError, TimeoutError } from "../src/errors/sdk-error.js";

describe("HTTP Client", () => {
  let mockFetch: ReturnType<typeof vi.fn> & typeof fetch;

  beforeEach(() => {
    mockFetch = vi.fn() as ReturnType<typeof vi.fn> & typeof fetch;
  });

  describe("httpRequest", () => {
    it("should make a successful GET request", async () => {
      const mockData = { status: "ok", balance: 100 };
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      const result = await httpRequest(
        "https://api.example.com/test",
        {
          method: "GET",
          fetch: mockFetch,
          timeout: 5000,
        }
      );

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should make a successful POST request with body", async () => {
      const mockData = { success: true };
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      const payload = { wallet: "ABC123", message: "Hello" };
      const result = await httpRequest(
        "https://api.example.com/auth",
        {
          method: "POST",
          body: payload,
          fetch: mockFetch,
          timeout: 5000,
        }
      );

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/auth",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload),
        })
      );
    });

    it("should throw HTTPError on bad status", async () => {
      const errorData = { error: "Not found" };
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(errorData), {
          status: 404,
          statusText: "Not Found",
          headers: { "content-type": "application/json" },
        })
      );

      await expect(
        httpRequest("https://api.example.com/notfound", {
          fetch: mockFetch,
          timeout: 5000,
        })
      ).rejects.toThrow(HTTPError);
    });

    it("should throw NetworkError on fetch failure", async () => {
      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await expect(
        httpRequest("https://api.example.com/test", {
          fetch: mockFetch,
          timeout: 5000,
        })
      ).rejects.toThrow(NetworkError);
    });

    it("should throw TimeoutError on timeout", async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve(
                  new Response(JSON.stringify({ ok: true }), { status: 200 })
                ),
              10000
            );
          })
      );

      await expect(
        httpRequest("https://api.example.com/slow", {
          fetch: mockFetch,
          timeout: 100,
        })
      ).rejects.toThrow(TimeoutError);
    });

    it("should include custom headers", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      await httpRequest("https://api.example.com/test", {
        headers: { "X-Custom-Header": "value" },
        fetch: mockFetch,
        timeout: 5000,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Custom-Header": "value",
          }),
        })
      );
    });
  });

  describe("get", () => {
    it("should perform a GET request", async () => {
      const mockData = { balance: 50 };
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      const result = await get("https://api.example.com/balance", {
        fetch: mockFetch,
        timeout: 5000,
      });

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("post", () => {
    it("should perform a POST request", async () => {
      const mockData = { verified: true };
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      const body = { wallet: "ABC", signature: [1, 2, 3] };
      const result = await post(
        "https://api.example.com/verify",
        body,
        {
          fetch: mockFetch,
          timeout: 5000,
        }
      );

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(body),
        })
      );
    });
  });
});
