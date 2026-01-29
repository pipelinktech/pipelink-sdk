/**
 * Auth module tests
 */

import { describe, it, expect, vi } from "vitest";
import { signMessage } from "../src/auth/signer.js";
import { verifySignature } from "../src/auth/verify.js";
import { ValidationError, HTTPError } from "../src/errors/sdk-error.js";
import { WalletAdapter, PipelinkConfig } from "../src/types/index.js";

describe("Auth Module", () => {
  describe("signMessage", () => {
    it("should sign a message with wallet adapter", async () => {
      const mockAdapter: WalletAdapter = {
        signMessage: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
        publicKey: { toBase58: () => "11111111111111111111111111111111" },
      };

      const result = await signMessage(mockAdapter, "Hello, Solana!");

      expect(result.address).toBe("11111111111111111111111111111111");
      expect(result.message).toBe("Hello, Solana!");
      expect(result.signature).toEqual(new Uint8Array([1, 2, 3]));
      expect(mockAdapter.signMessage).toHaveBeenCalled();
    });

    it("should convert string message to Uint8Array", async () => {
      const mockAdapter: WalletAdapter = {
        signMessage: vi.fn().mockResolvedValue(new Uint8Array([4, 5, 6])),
        publicKey: { toBase58: () => "wallet123" },
      };

      await signMessage(mockAdapter, "test message");

      const callArg = (mockAdapter.signMessage as any).mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(callArg)).toBe("test message");
    });

    it("should accept Uint8Array message", async () => {
      const mockAdapter: WalletAdapter = {
        signMessage: vi.fn().mockResolvedValue(new Uint8Array([7, 8, 9])),
        publicKey: { toBase58: () => "wallet456" },
      };

      const messageBytes = new TextEncoder().encode("binary message");
      const result = await signMessage(mockAdapter, messageBytes);

      expect(result.message).toBe("binary message");
    });

    it("should throw ValidationError if adapter is missing", async () => {
      await expect(
        signMessage(null as any, "message")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if adapter lacks signMessage", async () => {
      const mockAdapter: any = {
        publicKey: { toBase58: () => "wallet" },
      };

      await expect(
        signMessage(mockAdapter, "message")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if message is empty", async () => {
      const mockAdapter: WalletAdapter = {
        signMessage: vi.fn(),
        publicKey: { toBase58: () => "wallet" },
      };

      await expect(
        signMessage(mockAdapter, "")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError on invalid signature", async () => {
      const mockAdapter: WalletAdapter = {
        signMessage: vi.fn().mockResolvedValue(new Uint8Array()),
        publicKey: { toBase58: () => "wallet" },
      };

      await expect(
        signMessage(mockAdapter, "message")
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("verifySignature", () => {
    const config: PipelinkConfig = {
      baseUrl: "https://api.example.com",
      network: "mainnet-beta",
      timeout: 5000,
    };

    it("should verify signature via backend", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ verified: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      const payload = {
        wallet: "11111111111111111111111111111111",
        message: "Hello",
        signature: [1, 2, 3],
      };

      const result = await verifySignature(payload, {
        ...config,
        fetch: mockFetch,
      });

      expect(result.verified).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/auth/verify",
        expect.any(Object)
      );
    });

    it("should throw ValidationError if wallet is missing", async () => {
      const payload = {
        wallet: "",
        message: "Hello",
        signature: [1, 2, 3],
      };

      await expect(
        verifySignature(payload, config)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if message is missing", async () => {
      const payload = {
        wallet: "wallet123",
        message: "",
        signature: [1, 2, 3],
      };

      await expect(
        verifySignature(payload, config)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if signature is invalid", async () => {
      const payload = {
        wallet: "wallet123",
        message: "Hello",
        signature: [],
      };

      await expect(
        verifySignature(payload, config)
      ).rejects.toThrow(ValidationError);
    });

    it("should propagate HTTPError from backend", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          statusText: "Bad Request",
          headers: { "content-type": "application/json" },
        })
      );

      const payload = {
        wallet: "wallet123",
        message: "Hello",
        signature: [1, 2, 3],
      };

      await expect(
        verifySignature(payload, { ...config, fetch: mockFetch })
      ).rejects.toThrow(HTTPError);
    });
  });
});
