/**
 * Main PIPELINK SDK Client
 */

import { PipelinkConfig } from "./types/index.js";
import { normalizeConfig } from "./config.js";
import * as authSigner from "./auth/signer.js";
import * as authVerify from "./auth/verify.js";
import * as walletBalance from "./wallet/balance.js";
import * as pipelineCreate from "./pipeline/create.js";

/**
 * Service namespace for auth operations
 */
export interface AuthService {
  signMessage: typeof authSigner.signMessage;
  verifySignature: (payload: Parameters<typeof authVerify.verifySignature>[0]) => ReturnType<typeof authVerify.verifySignature>;
}

/**
 * Service namespace for wallet operations
 */
export interface WalletService {
  getBalance: (address: Parameters<typeof walletBalance.getWalletBalance>[0]) => ReturnType<typeof walletBalance.getWalletBalance>;
}

/**
 * Service namespace for pipeline operations
 */
export interface PipelineService {
  create: (config: Parameters<typeof pipelineCreate.createPipeline>[0]) => ReturnType<typeof pipelineCreate.createPipeline>;
}

/**
 * Main PIPELINK SDK Client
 *
 * Provides grouped access to all SDK services:
 * - auth: Message signing and verification
 * - wallet: Balance fetching
 * - pipeline: Pipeline creation
 */
export class PipelinkClient {
  private config: PipelinkConfig;
  public readonly auth: AuthService;
  public readonly wallet: WalletService;
  public readonly pipeline: PipelineService;

  /**
   * Creates a new PIPELINK SDK client
   * @param config - SDK configuration
   */
  constructor(config: Partial<PipelinkConfig>) {
    this.config = normalizeConfig(config);

    // Bind auth service methods
    this.auth = {
      signMessage: authSigner.signMessage,
      verifySignature: (payload) => authVerify.verifySignature(payload, this.config),
    };

    // Bind wallet service methods
    this.wallet = {
      getBalance: (address) => walletBalance.getWalletBalance(address, this.config),
    };

    // Bind pipeline service methods
    this.pipeline = {
      create: (pipelineConfig) => pipelineCreate.createPipeline(pipelineConfig, this.config),
    };
  }

  /**
   * Gets the current SDK configuration
   */
  public getConfig(): PipelinkConfig {
    return { ...this.config };
  }
}
