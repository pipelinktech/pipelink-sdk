/**
 * SDK Error Classes
 */

/**
 * Base error class for all SDK errors
 */
export class SDKError extends Error {
  public readonly code: string;
  public readonly originalError?: Error;

  constructor(message: string, code: string = "SDK_ERROR", originalError?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.originalError = originalError;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * HTTP error with status code and response data
 */
export class HTTPError extends SDKError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data?: unknown;

  constructor(
    message: string,
    status: number,
    statusText: string,
    data?: unknown,
    originalError?: Error
  ) {
    super(message, "HTTP_ERROR", originalError);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Network error (connection issues, timeouts, etc.)
 */
export class NetworkError extends SDKError {
  constructor(message: string, originalError?: Error) {
    super(message, "NETWORK_ERROR", originalError);
  }
}

/**
 * Validation error
 */
export class ValidationError extends SDKError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends SDKError {
  public readonly timeout: number;

  constructor(message: string, timeout: number) {
    super(message, "TIMEOUT_ERROR");
    this.timeout = timeout;
  }
}
