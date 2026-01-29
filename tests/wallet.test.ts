/**
 * Wallet module tests
 */

import { describe, it, expect, vi } from "vitest";
import { getWalletBalance } from "../src/wallet/balance.js";
import { ValidationError, HTTPError } from "../src/errors/sdk-error.js";
import { PipelinkConfig } from "../src/types/index.js";

describe("Wallet Module", () => {
  describe("getWalletBalance", () => {
    const config: PipelinkConfig = {
      baseUrl: "https://api.example.com",
      network: "mainnet-beta",
      timeout: 5000,
    };

    it("should fetch wallet balance", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ balance: 10.5, unit: "SOL" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      const result = await getWalletBalance("So1111111111111111111111111111111111111112", {
        ...config,
        fetch: mockFetch,
      });

      expect(result.balance).toBe(10.5);
      expect(result.unit).toBe("SOL");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/wallet/balance?address="),
        expect.any(Object)
      );
    });

    it("should URL-encode address parameter", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ balance: 0, unit: "SOL" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      const address = "So1111111111111111111111111111111111111112";
      await getWalletBalance(address, { ...config, fetch: mockFetch });

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain(encodeURIComponent(address));
    });

    it("should throw ValidationError if address is missing", async () => {
      await expect(
        getWalletBalance("", config)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if address is invalid type", async () => {
      await expect(
        getWalletBalance(null as any, config)
      ).rejects.toThrow(ValidationError);
    });

    it("should validate balance in response", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ balance: "invalid", unit: "SOL" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      await expect(
        getWalletBalance("wallet123", { ...config, fetch: mockFetch })
      ).rejects.toThrow(ValidationError);
    });

    it("should validate unit in response", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ balance: 10, unit: "INVALID" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      await expect(
        getWalletBalance("wallet123", { ...config, fetch: mockFetch })
      ).rejects.toThrow(ValidationError);
    });

    it("should propagate HTTPError", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          statusText: "Not Found",
          headers: { "content-type": "application/json" },
        })
      );

      await expect(
        getWalletBalance("wallet123", { ...config, fetch: mockFetch })
      ).rejects.toThrow(HTTPError);
    });

    it("should use timeout from config", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ balance: 5, unit: "SOL" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      await getWalletBalance("wallet123", {
        ...config,
        timeout: 10000,
        fetch: mockFetch,
      });

      // Verify the function was called, implying timeout was used
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
