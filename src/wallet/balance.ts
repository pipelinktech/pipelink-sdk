/**
 * Wallet balance fetching
 */

import { BalanceResponse, PipelinkConfig } from "../types/index.js";
import { get } from "../utils/http.js";
import { ValidationError } from "../errors/sdk-error.js";

/**
 * Fetches wallet balance from backend
 * @param address - Solana wallet address
 * @param config - SDK configuration
 * @returns Balance response with amount and unit
 */
export async function getWalletBalance(
  address: string,
  config: PipelinkConfig
): Promise<BalanceResponse> {
  // Validate address
  if (!address || typeof address !== "string") {
    throw new ValidationError("Valid wallet address is required");
  }

  if (address.length === 0) {
    throw new ValidationError("Wallet address cannot be empty");
  }

  // Validate config
  if (!config.baseUrl) {
    throw new ValidationError("SDK config is invalid");
  }

  const url = `${config.baseUrl}/api/wallet/balance?address=${encodeURIComponent(address)}`;
  const timeout = config.timeout || 30000;

  try {
    const response = await get<BalanceResponse>(url, {
      fetch: config.fetch,
      timeout,
    });

    if (!response || typeof response !== "object") {
      throw new ValidationError("Invalid response from wallet balance endpoint");
    }

    if (typeof response.balance !== "number") {
      throw new ValidationError("Balance must be a number");
    }

    if (response.unit !== "SOL") {
      throw new ValidationError("Unit must be SOL");
    }

    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw error;
  }
}
