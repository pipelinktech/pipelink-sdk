/**
 * Pipeline creation
 */

import { CreatePipelineConfig, PipelineResponse, PipelinkConfig } from "../types/index.js";
import { post } from "../utils/http.js";
import { ValidationError } from "../errors/sdk-error.js";

/**
 * Creates a pipeline via backend
 * @param pipelineConfig - Pipeline configuration
 * @param config - SDK configuration
 * @returns Pipeline response with ID and status
 */
export async function createPipeline(
  pipelineConfig: CreatePipelineConfig,
  config: PipelinkConfig
): Promise<PipelineResponse> {
  // Validate pipeline config
  if (!pipelineConfig || typeof pipelineConfig !== "object") {
    throw new ValidationError("Pipeline configuration is required");
  }

  if (!pipelineConfig.name || typeof pipelineConfig.name !== "string") {
    throw new ValidationError("Pipeline name is required");
  }

  if (pipelineConfig.name.length === 0) {
    throw new ValidationError("Pipeline name cannot be empty");
  }

  // Validate SDK config
  if (!config.baseUrl) {
    throw new ValidationError("SDK config is invalid");
  }

  const url = `${config.baseUrl}/api/pipeline/create`;
  const timeout = config.timeout || 30000;

  try {
    const response = await post<PipelineResponse>(url, pipelineConfig, {
      fetch: config.fetch,
      timeout,
    });

    if (!response || typeof response !== "object") {
      throw new ValidationError("Invalid response from pipeline create endpoint");
    }

    if (!response.pipelineId || typeof response.pipelineId !== "string") {
      throw new ValidationError("Pipeline ID is required in response");
    }

    if (!response.status || typeof response.status !== "string") {
      throw new ValidationError("Pipeline status is required in response");
    }

    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw error;
  }
}
