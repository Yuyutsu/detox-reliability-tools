import { reliableTap } from "../src/actions/reliableTap";

function makeDetoxMocks(overrides: {
  tapError?: Error;
  tapErrorCount?: number;
  waitForVisible?: boolean;
} = {}) {
  const { tapError, tapErrorCount = 1, waitForVisible = true } = overrides;

  let tapCallCount = 0;

  const el = {
    tap: jest.fn(async () => {
      tapCallCount++;
      if (tapError && tapCallCount <= tapErrorCount) {
        throw tapError;
      }
    }),
    typeText: jest.fn().mockResolvedValue(undefined),
    clearText: jest.fn().mockResolvedValue(undefined),
  };

  const withTimeoutFn = jest.fn().mockReturnThis();
  const toBeVisibleFn = jest.fn().mockReturnValue({
    withTimeout: waitForVisible
      ? jest.fn().mockResolvedValue(undefined)
      : jest.fn().mockRejectedValue(new Error("element not visible")),
  });

  const waitForFn = jest.fn().mockReturnValue({
    toBeVisible: toBeVisibleFn,
  });

  const elementFn = jest.fn().mockReturnValue(el);

  return { el, elementFn, waitForFn, withTimeoutFn };
}

describe("reliableTap", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("taps the element when it is visible on the first attempt", async () => {
    const { el, elementFn, waitForFn } = makeDetoxMocks();

    const promise = reliableTap("matcher", {}, elementFn, waitForFn);
    await jest.runAllTimersAsync();
    await promise;

    expect(el.tap).toHaveBeenCalledTimes(1);
  });

  it("retries tap on failure and succeeds on a later attempt", async () => {
    const { el, elementFn, waitForFn } = makeDetoxMocks({
      tapError: new Error("element not ready"),
      tapErrorCount: 2,
    });

    const promise = reliableTap(
      "matcher",
      { attempts: 3, delay: 10 },
      elementFn,
      waitForFn
    );
    await jest.runAllTimersAsync();
    await promise;

    expect(el.tap).toHaveBeenCalledTimes(3);
  });

  it("throws when the element never becomes visible", async () => {
    const { elementFn, waitForFn } = makeDetoxMocks({
      waitForVisible: false,
    });

    // Attach rejection handler before advancing timers to prevent unhandled rejection
    const expectation = expect(
      reliableTap("matcher", { timeout: 100 }, elementFn, waitForFn)
    ).rejects.toThrow();
    await jest.runAllTimersAsync();
    await expectation;
  });

  it("throws a clear error when elementFn is not available", async () => {
    // Pass undefined cast to any to simulate missing global
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reliableTap("matcher", {}, undefined as any, undefined as any)
    ).rejects.toThrow(/Detox `element` global is not available/);
  });
});
