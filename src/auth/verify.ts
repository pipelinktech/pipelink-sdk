/**
 * Signature verification via backend
 */

import { AuthPayload, AuthResponse, PipelinkConfig } from "../types/index.js";
import { post } from "../utils/http.js";
import { ValidationError } from "../errors/sdk-error.js";

/**
 * Verifies a signature with the backend
 * @param payload - Auth payload with wallet, message, and signature
 * @param config - SDK configuration
 * @returns Auth response from backend
 */
export async function verifySignature(
  payload: AuthPayload,
  config: PipelinkConfig
): Promise<AuthResponse> {
  // Validate payload
  if (!payload.wallet) {
    throw new ValidationError("Wallet address is required");
  }

  if (!payload.message) {
    throw new ValidationError("Message is required");
  }

  if (!Array.isArray(payload.signature) || payload.signature.length === 0) {
    throw new ValidationError("Valid signature array is required");
  }

  // Validate config
  if (!config.baseUrl) {
    throw new ValidationError("SDK config is invalid");
  }

  const url = `${config.baseUrl}/api/auth/verify`;
  const timeout = config.timeout || 30000;

  try {
    const response = await post<AuthResponse>(url, payload, {
      fetch: config.fetch,
      timeout,
    });

    if (!response || typeof response !== "object") {
      throw new ValidationError("Invalid response from auth verify endpoint");
    }

    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw error;
  }
}
