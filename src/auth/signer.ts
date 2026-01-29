/**
 * Wallet message signing
 */

import { WalletAdapter, SignResult } from "../types/index.js";
import { ValidationError } from "../errors/sdk-error.js";

/**
 * Signs a message using a wallet adapter
 * @param walletAdapter - Wallet adapter with signMessage capability
 * @param message - Message to sign (will be converted to Uint8Array if string)
 * @returns Sign result with address, message, and signature
 */
export async function signMessage(
  walletAdapter: WalletAdapter,
  message: string | Uint8Array
): Promise<SignResult> {
  if (!walletAdapter) {
    throw new ValidationError("Wallet adapter is required");
  }

  if (!walletAdapter.signMessage) {
    throw new ValidationError("Wallet adapter must support signMessage");
  }

  if (!walletAdapter.publicKey) {
    throw new ValidationError("Wallet adapter must have a publicKey");
  }

  // Convert message to Uint8Array if it's a string
  const messageBytes = typeof message === "string"
    ? new TextEncoder().encode(message)
    : message;

  // Validate message
  if (messageBytes.length === 0) {
    throw new ValidationError("Message cannot be empty");
  }

  try {
    const signature = await walletAdapter.signMessage(messageBytes);

    if (!signature || signature.length === 0) {
      throw new ValidationError("Wallet returned invalid signature");
    }

    return {
      address: walletAdapter.publicKey.toBase58(),
      message: typeof message === "string" ? message : new TextDecoder().decode(message),
      signature,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError(
      `Failed to sign message: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
