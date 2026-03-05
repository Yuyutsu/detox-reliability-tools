/**
 * detox-reliability-tools
 *
 * A utility library that improves reliability, stability, and debugging of
 * Detox end-to-end tests for React Native applications.
 *
 * @example
 * import { reliableTap, waitForUIStable, retry, debug } from "detox-reliability-tools";
 */

// ── Actions ──────────────────────────────────────────────────────────────────
export { reliableTap } from "./actions/reliableTap";
export { reliableType } from "./actions/reliableType";

// ── Wait helpers ─────────────────────────────────────────────────────────────
export { waitForNetworkIdle } from "./wait/waitForNetworkIdle";
export { waitForUIStable } from "./wait/waitForUIStable";

// ── Utilities ─────────────────────────────────────────────────────────────────
export { retry, sleep } from "./utils/retry";
export { withTimeout } from "./utils/timeout";

// ── Debug namespace ───────────────────────────────────────────────────────────
import { captureScreenshot } from "./debug/captureScreenshot";
import {
  logCurrentScreen,
  printVisibleElements,
} from "./debug/printVisibleElements";

export const debug = {
  captureScreenshot,
  printVisibleElements,
  logCurrentScreen,
};

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  RetryOptions,
  TimeoutOptions,
  ReliableTapOptions,
  ReliableTypeOptions,
  WaitForNetworkIdleOptions,
  WaitForUIStableOptions,
  DetoxElement,
  DetoxMatcher,
  ElementFactory,
  DetoxDevice,
} from "./types/detoxReliabilityTypes";
