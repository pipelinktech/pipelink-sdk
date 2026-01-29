/**
 * Core type definitions for the PIPELINK SDK
 */

/**
 * Network identifier
 */
export type NetworkType = "mainnet-beta";

/**
 * SDK Configuration
 */
export interface PipelinkConfig {
  baseUrl: string;
  network: NetworkType;
  timeout?: number;
  fetch?: typeof fetch;
}

/**
 * Wallet adapter interface for signing
 */
export interface WalletAdapter {
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  publicKey: {
    toBase58(): string;
  };
}

/**
 * Auth payload for signature verification
 */
export interface AuthPayload {
  wallet: string;
  message: string;
  signature: number[];
}

/**
 * Auth response from backend
 */
export interface AuthResponse {
  verified: boolean;
  message?: string;
}

/**
 * Wallet balance response
 */
export interface BalanceResponse {
  balance: number;
  unit: "SOL";
}

/**
 * Pipeline creation configuration
 */
export interface CreatePipelineConfig {
  name: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Pipeline response
 */
export interface PipelineResponse {
  pipelineId: string;
  status: string;
  [key: string]: unknown;
}

/**
 * Sign result
 */
export interface SignResult {
  address: string;
  message: string;
  signature: Uint8Array;
}

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/**
 * HTTP error response
 */
export interface HttpErrorResponse {
  status: number;
  statusText: string;
  data?: unknown;
}
