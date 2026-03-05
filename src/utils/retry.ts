import type { RetryOptions } from "../types/detoxReliabilityTypes";

/**
 * Retries an asynchronous action up to `attempts` times, waiting `delay` ms
 * between each attempt.  Throws the last error if all attempts fail.
 *
 * @example
 * await retry(async () => {
 *   await element(by.id("submit")).tap();
 * }, { attempts: 3, delay: 300 });
 */
export async function retry<T>(
  action: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { attempts = 3, delay = 500 } = options;

  if (attempts < 1) {
    throw new Error(`retry: "attempts" must be at least 1, got ${attempts}`);
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await action();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/** Resolves after `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
