import { captureScreenshot } from "../src/debug/captureScreenshot";
import {
  printVisibleElements,
  logCurrentScreen,
} from "../src/debug/printVisibleElements";

describe("captureScreenshot", () => {
  it("returns the screenshot path when device is available", async () => {
    const device = {
      takeScreenshot: jest.fn().mockResolvedValue("/tmp/screenshot.png"),
    };

    const result = await captureScreenshot("test-screen", device);
    expect(result).toBe("/tmp/screenshot.png");
    expect(device.takeScreenshot).toHaveBeenCalledWith(
      expect.stringMatching(/^test-screen-/)
    );
  });

  it("returns null and warns when device is not available", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const result = await captureScreenshot("test", undefined);

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("device` is not available")
    );
    warnSpy.mockRestore();
  });

  it("returns null and warns when takeScreenshot throws", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const device = {
      takeScreenshot: jest.fn().mockRejectedValue(new Error("disk full")),
    };

    const result = await captureScreenshot("error-case", device);
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("captureScreenshot failed")
    );
    warnSpy.mockRestore();
  });

  it("uses the default name 'screenshot' when no name is provided", async () => {
    const device = {
      takeScreenshot: jest.fn().mockResolvedValue("/tmp/screenshot.png"),
    };

    await captureScreenshot(undefined, device);
    expect(device.takeScreenshot).toHaveBeenCalledWith(
      expect.stringMatching(/^screenshot-/)
    );
  });
});

describe("printVisibleElements", () => {
  it("logs visible status for each supplied element ID", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const getAttributes = jest.fn().mockResolvedValue({ visible: true });
    const el = { getAttributes };
    const elementFn = jest.fn().mockReturnValue(el);
    const byFn = { id: jest.fn((id: string) => `matcher:${id}`) };

    await printVisibleElements(["btn1", "btn2"], elementFn, byFn);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("btn1"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("btn2"));
    logSpy.mockRestore();
  });

  it("logs 'not found' when getAttributes throws", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const el = {
      getAttributes: jest.fn().mockRejectedValue(new Error("not found")),
    };
    const elementFn = jest.fn().mockReturnValue(el);
    const byFn = { id: jest.fn() };

    await printVisibleElements(["missingBtn"], elementFn, byFn);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("not found / not accessible")
    );
    logSpy.mockRestore();
  });

  it("warns when Detox globals are not available", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    await printVisibleElements(["btn"], undefined, undefined);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Detox globals are not available")
    );
    warnSpy.mockRestore();
  });
});

describe("logCurrentScreen", () => {
  it("logs the current activity when the API is available", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const device = {
      getCurrentActivity: jest.fn().mockResolvedValue("MainActivity"),
    };

    await logCurrentScreen(device);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("MainActivity")
    );
    logSpy.mockRestore();
  });

  it("logs a not-supported message when getCurrentActivity is absent", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await logCurrentScreen({});

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("not supported on this platform")
    );
    logSpy.mockRestore();
  });

  it("warns when device is not available", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    await logCurrentScreen(undefined);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("device` is not available")
    );
    warnSpy.mockRestore();
  });

  it("warns when getCurrentActivity throws", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const device = {
      getCurrentActivity: jest.fn().mockRejectedValue(new Error("crash")),
    };

    await logCurrentScreen(device);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("logCurrentScreen failed")
    );
    warnSpy.mockRestore();
  });
});
