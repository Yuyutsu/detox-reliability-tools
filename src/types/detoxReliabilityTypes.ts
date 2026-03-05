/**
 * Shared TypeScript types for detox-reliability-tools.
 */

/** Options controlling retry behaviour. */
export interface RetryOptions {
  /** Number of attempts (including the first). Default: 3 */
  attempts?: number;
  /** Milliseconds to wait between attempts. Default: 500 */
  delay?: number;
}

/** Options controlling timeout behaviour. */
export interface TimeoutOptions {
  /** Maximum milliseconds to wait. Default: 5000 */
  timeout?: number;
  /** Human-readable label used in error messages. */
  label?: string;
}

/** Options for reliableTap. */
export interface ReliableTapOptions extends RetryOptions, TimeoutOptions {}

/** Options for reliableType. */
export interface ReliableTypeOptions extends RetryOptions, TimeoutOptions {
  /** Optional delay in milliseconds between individual characters. */
  characterDelay?: number;
}

/** Options for waitForNetworkIdle. */
export interface WaitForNetworkIdleOptions {
  /** Maximum milliseconds to wait for network to become idle. Default: 10000 */
  timeout?: number;
  /** Milliseconds of idle time before the network is considered idle. Default: 500 */
  idleDuration?: number;
}

/** Options for waitForUIStable. */
export interface WaitForUIStableOptions {
  /** Milliseconds to pause after waiting for animations to settle. Default: 300 */
  delay?: number;
  /** Maximum milliseconds to wait for UI stability. Default: 5000 */
  timeout?: number;
}

/**
 * Minimal surface of the Detox `element` API that this library relies on.
 * The full Detox types are a peer dependency and optional at runtime.
 */
export interface DetoxElement {
  tap(): Promise<void>;
  typeText(text: string): Promise<void>;
  clearText(): Promise<void>;
}

/**
 * Minimal surface of the Detox `ElementFacade` returned by `element(matcher)`.
 * Typed loosely so callers can pass the real Detox element without importing
 * Detox types into this package.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DetoxMatcher = any;

/** A factory function compatible with Detox's `element(matcher)` global. */
export type ElementFactory = (matcher: DetoxMatcher) => DetoxElement;

/** Represents the subset of Detox's `device` API used for debugging. */
export interface DetoxDevice {
  takeScreenshot(name: string): Promise<string>;
}
