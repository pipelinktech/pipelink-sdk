/**
 * SDK Configuration Management
 */

import { PipelinkConfig } from "./types/index.js";

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_NETWORK = "mainnet-beta" as const;

/**
 * Validates and normalizes SDK configuration
 */
export function normalizeConfig(config: Partial<PipelinkConfig>): PipelinkConfig {
  if (!config.baseUrl) {
    throw new Error("baseUrl is required");
  }

  if (!config.baseUrl.startsWith("http://") && !config.baseUrl.startsWith("https://")) {
    throw new Error("baseUrl must start with http:// or https://");
  }

  return {
    baseUrl: config.baseUrl.replace(/\/$/, ""), // Remove trailing slash
    network: config.network || DEFAULT_NETWORK,
    timeout: config.timeout || DEFAULT_TIMEOUT,
    fetch: config.fetch,
  };
}
