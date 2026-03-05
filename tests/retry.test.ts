import { retry, sleep } from "../src/utils/retry";

describe("retry", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("resolves immediately when the action succeeds on the first attempt", async () => {
    const action = jest.fn().mockResolvedValue("ok");
    const result = await retry(action);
    expect(result).toBe("ok");
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and resolves when a later attempt succeeds", async () => {
    const action = jest
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValue("success");

    const promise = retry(action, { attempts: 3, delay: 10 });
    await jest.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe("success");
    expect(action).toHaveBeenCalledTimes(3);
  });

  it("throws the last error when all attempts fail", async () => {
    const action = jest
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockRejectedValueOnce(new Error("always fails"));

    const promise = retry(action, { attempts: 3, delay: 10 });
    // Attach rejection handler before advancing timers to avoid unhandled rejection warnings
    const expectation = expect(promise).rejects.toThrow("always fails");
    await jest.runAllTimersAsync();
    await expectation;
    expect(action).toHaveBeenCalledTimes(3);
  });

  it("throws immediately with a clear message when attempts < 1", async () => {
    await expect(retry(async () => {}, { attempts: 0 })).rejects.toThrow(
      /attempts.*must be at least 1/
    );
  });

  it("uses default options (3 attempts, 500 ms delay) when none are provided", async () => {
    const action = jest
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("ok");

    const promise = retry(action);
    await jest.runAllTimersAsync();
    const result = await promise;
    expect(result).toBe("ok");
    expect(action).toHaveBeenCalledTimes(2);
  });

  it("does not sleep after the final attempt", async () => {
    const sleepSpy = jest
      .spyOn(require("../src/utils/retry"), "sleep")
      .mockResolvedValue(undefined);

    const action = jest.fn().mockResolvedValue("done");
    await retry(action, { attempts: 1, delay: 500 });

    // sleep should NOT be called because there is nothing to wait after success
    expect(sleepSpy).not.toHaveBeenCalled();
    sleepSpy.mockRestore();
  });
});

describe("sleep", () => {
  it("resolves after the specified delay", async () => {
    jest.useFakeTimers();
    const promise = sleep(200);
    jest.advanceTimersByTime(200);
    await expect(promise).resolves.toBeUndefined();
    jest.useRealTimers();
  });
});

