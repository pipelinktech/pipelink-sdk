/**
 * Pipeline module tests
 */

import { describe, it, expect, vi } from "vitest";
import { createPipeline } from "../src/pipeline/create.js";
import { ValidationError, HTTPError } from "../src/errors/sdk-error.js";
import { PipelinkConfig, CreatePipelineConfig } from "../src/types/index.js";

describe("Pipeline Module", () => {
  describe("createPipeline", () => {
    const config: PipelinkConfig = {
      baseUrl: "https://api.example.com",
      network: "mainnet-beta",
      timeout: 5000,
    };

    it("should create a pipeline", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
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
      );

      const pipelineConfig: CreatePipelineConfig = {
        name: "My Pipeline",
        description: "Test pipeline",
      };

      const result = await createPipeline(pipelineConfig, {
        ...config,
        fetch: mockFetch,
      });

      expect(result.pipelineId).toBe("pipe_123");
      expect(result.status).toBe("active");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/api/pipeline/create",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(pipelineConfig),
        })
      );
    });

    it("should accept additional config properties", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            pipelineId: "pipe_456",
            status: "pending",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        )
      );

      const pipelineConfig: CreatePipelineConfig = {
        name: "Advanced Pipeline",
        description: "With extra fields",
        customField: "customValue",
        anotherField: 123,
      };

      const result = await createPipeline(pipelineConfig, {
        ...config,
        fetch: mockFetch,
      });

      expect(result.pipelineId).toBe("pipe_456");
    });

    it("should throw ValidationError if config is missing", async () => {
      await expect(
        createPipeline(null as any, config)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if name is missing", async () => {
      const pipelineConfig: any = { description: "No name" };

      await expect(
        createPipeline(pipelineConfig, config)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if name is empty", async () => {
      const pipelineConfig: CreatePipelineConfig = { name: "" };

      await expect(
        createPipeline(pipelineConfig, config)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if response lacks pipelineId", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "active" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      const pipelineConfig: CreatePipelineConfig = { name: "Test" };

      await expect(
        createPipeline(pipelineConfig, { ...config, fetch: mockFetch })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if response lacks status", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ pipelineId: "pipe_789" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );

      const pipelineConfig: CreatePipelineConfig = { name: "Test" };

      await expect(
        createPipeline(pipelineConfig, { ...config, fetch: mockFetch })
      ).rejects.toThrow(ValidationError);
    });

    it("should propagate HTTPError from backend", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Invalid configuration" }), {
          status: 400,
          statusText: "Bad Request",
          headers: { "content-type": "application/json" },
        })
      );

      const pipelineConfig: CreatePipelineConfig = { name: "Invalid" };

      await expect(
        createPipeline(pipelineConfig, { ...config, fetch: mockFetch })
      ).rejects.toThrow(HTTPError);
    });
  });
});
