/**
 * PIPELINK SDK - Public API
 */

// Export types
export * from "./types/index.js";

// Export SDK client
export { PipelinkClient } from "./client.js";

// Export error classes
export { SDKError, HTTPError, NetworkError, ValidationError, TimeoutError } from "./errors/sdk-error.js";

// Export individual functions for tree-shaking
export { signMessage } from "./auth/signer.js";
export { verifySignature } from "./auth/verify.js";
export { getWalletBalance } from "./wallet/balance.js";
export { createPipeline } from "./pipeline/create.js";
