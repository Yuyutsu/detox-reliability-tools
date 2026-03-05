import { reliableType } from "../src/actions/reliableType";

function makeDetoxMocks(overrides: {
  typeError?: Error;
  typeErrorCount?: number;
  waitForVisible?: boolean;
} = {}) {
  const { typeError, typeErrorCount = 1, waitForVisible = true } = overrides;

  let typeCallCount = 0;

  const el = {
    tap: jest.fn().mockResolvedValue(undefined),
    typeText: jest.fn(async () => {
      typeCallCount++;
      if (typeError && typeCallCount <= typeErrorCount) {
        throw typeError;
      }
    }),
    clearText: jest.fn().mockResolvedValue(undefined),
  };

  const waitForFn = jest.fn().mockReturnValue({
    toBeVisible: jest.fn().mockReturnValue({
      withTimeout: waitForVisible
        ? jest.fn().mockResolvedValue(undefined)
        : jest.fn().mockRejectedValue(new Error("element not visible")),
    }),
  });

  const elementFn = jest.fn().mockReturnValue(el);

  return { el, elementFn, waitForFn };
}

describe("reliableType", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("types the text into the element on the first attempt", async () => {
    const { el, elementFn, waitForFn } = makeDetoxMocks();

    const promise = reliableType("matcher", "hello", {}, elementFn, waitForFn);
    await jest.runAllTimersAsync();
    await promise;

    expect(el.clearText).toHaveBeenCalledTimes(1);
    expect(el.typeText).toHaveBeenCalledWith("hello");
  });

  it("retries typing on failure and succeeds on a later attempt", async () => {
    const { el, elementFn, waitForFn } = makeDetoxMocks({
      typeError: new Error("input not ready"),
      typeErrorCount: 1,
    });

    const promise = reliableType(
      "matcher",
      "world",
      { attempts: 2, delay: 10 },
      elementFn,
      waitForFn
    );
    await jest.runAllTimersAsync();
    await promise;

    // 1 failed + 1 success = 2 typeText calls
    expect(el.typeText).toHaveBeenCalledTimes(2);
  });

  it("types characters one-by-one when characterDelay is set", async () => {
    const { el, elementFn, waitForFn } = makeDetoxMocks();

    const text = "abc";
    const promise = reliableType(
      "matcher",
      text,
      { characterDelay: 50 },
      elementFn,
      waitForFn
    );
    await jest.runAllTimersAsync();
    await promise;

    // Should have called typeText once for each character.
    expect(el.typeText).toHaveBeenCalledTimes(3);
    expect(el.typeText).toHaveBeenNthCalledWith(1, "a");
    expect(el.typeText).toHaveBeenNthCalledWith(2, "b");
    expect(el.typeText).toHaveBeenNthCalledWith(3, "c");
  });

  it("throws a clear error when elementFn is not available", async () => {
    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reliableType("matcher", "text", {}, undefined as any, undefined as any)
    ).rejects.toThrow(/Detox `element` global is not available/);
  });

  it("throws when the element never becomes visible", async () => {
    const { elementFn, waitForFn } = makeDetoxMocks({ waitForVisible: false });

    // Attach rejection handler before advancing timers to prevent unhandled rejection
    const expectation = expect(
      reliableType("matcher", "text", { timeout: 100 }, elementFn, waitForFn)
    ).rejects.toThrow();
    await jest.runAllTimersAsync();
    await expectation;
  });
});
