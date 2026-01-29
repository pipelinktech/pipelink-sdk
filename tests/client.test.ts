/**
 * Main SDK Client tests
 */

import { describe, it, expect, vi } from "vitest";
import { PipelinkClient } from "../src/client.js";
import { ValidationError } from "../src/errors/sdk-error.js";

describe("PipelinkClient", () => {
  describe("initialization", () => {
    it("should create a client with valid config", () => {
      const client = new PipelinkClient({
        baseUrl: "https://api.example.com",
        network: "mainnet-beta",
      });

      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.wallet).toBeDefined();
      expect(client.pipeline).toBeDefined();
    });

    it("should throw error if baseUrl is missing", () => {
      expect(() => {
        new PipelinkClient({
          network: "mainnet-beta",
        } as any);
      }).toThrow(Error);
    });

    it("should throw error if baseUrl is invalid", () => {
      expect(() => {
        new PipelinkClient({
          baseUrl: "not-a-url",
          network: "mainnet-beta",
        });
      }).toThrow(Error);
    });

    it("should remove trailing slash from baseUrl", () => {
      const client = new PipelinkClient({
        baseUrl: "https://api.example.com/",
        network: "mainnet-beta",
      });

      const config = client.getConfig();
      expect(config.baseUrl).toBe("https://api.example.com");
    });

    it("should set default timeout", () => {
      const client = new PipelinkClient({
        baseUrl: "https://api.example.com",
        network: "mainnet-beta",
      });

      const config = client.getConfig();
      expect(config.timeout).toBe(30000);
    });

    it("should use custom timeout", () => {
      const client = new PipelinkClient({
        baseUrl: "https://api.example.com",
        network: "mainnet-beta",
        timeout: 10000,
      });

      const config = client.getConfig();
      expect(config.timeout).toBe(10000);
    });

    it("should inject custom fetch", () => {
      const customFetch = vi.fn() as typeof fetch;
      const client = new PipelinkClient({
        baseUrl: "https://api.example.com",
        network: "mainnet-beta",
        fetch: customFetch,
      });

      const config = client.getConfig();
      expect(config.fetch).toBe(customFetch);
    });
  });

  describe("services", () => {
    const client = new PipelinkClient({
      baseUrl: "https://api.example.com",
      network: "mainnet-beta",
    });

    it("should expose auth service methods", () => {
      expect(typeof client.auth.signMessage).toBe("function");
      expect(typeof client.auth.verifySignature).toBe("function");
    });

    it("should expose wallet service methods", () => {
      expect(typeof client.wallet.getBalance).toBe("function");
    });

    it("should expose pipeline service methods", () => {
      expect(typeof client.pipeline.create).toBe("function");
    });
  });

  describe("getConfig", () => {
    it("should return a copy of config", () => {
      const client = new PipelinkClient({
        baseUrl: "https://api.example.com",
        network: "mainnet-beta",
        timeout: 5000,
      });

      const config1 = client.getConfig();
      const config2 = client.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Different object
    });
  });

  describe("service method binding", () => {
    it("verifySignature should have access to config", async () => {
      const mockFetch = (vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ verified: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )) as typeof fetch;

      const client = new PipelinkClient({
        baseUrl: "https://api.example.com",
        network: "mainnet-beta",
        fetch: mockFetch,
      });

      await client.auth.verifySignature({
        wallet: "wallet123",
        message: "hello",
        signature: [1, 2, 3],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/auth/verify",
        expect.any(Object)
      );
    });

    it("getBalance should have access to config", async () => {
      const mockFetch = (vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ balance: 10, unit: "SOL" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )) as typeof fetch;

      const client = new PipelinkClient({
        baseUrl: "https://api.example.com",
        network: "mainnet-beta",
        fetch: mockFetch,
      });

      await client.wallet.getBalance("wallet123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/wallet/balance?address="),
        expect.any(Object)
      );
    });

    it("create should have access to config", async () => {
      const mockFetch = (vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            pipelineId: "pipe_123",
            status: "active",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        )
      )) as typeof fetch;

      const client = new PipelinkClient({
        baseUrl: "https://api.example.com",
        network: "mainnet-beta",
        fetch: mockFetch,
      });

      await client.pipeline.create({ name: "Test" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/pipeline/create",
        expect.any(Object)
      );
    });
  });
});
