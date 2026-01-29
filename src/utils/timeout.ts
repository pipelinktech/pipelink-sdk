/**
 * Timeout utilities
 */

import { TimeoutError } from "../errors/sdk-error.js";

/**
 * Creates a promise that rejects after a specified timeout
 */
export function createTimeoutPromise<T>(timeout: number): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`Request timeout after ${timeout}ms`, timeout));
    }, timeout);
  });
}

/**
 * Races a promise against a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> {
  return Promise.race([promise, createTimeoutPromise<T>(timeout)]);
}
