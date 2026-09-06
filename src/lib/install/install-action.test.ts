import { describe, expect, test } from "bun:test";
import {
  resolveInstallAction,
  shouldShowInstall,
} from "@/lib/install/install-action";

const NOTHING_APPLIES = {
  isInstalled: false,
  isDismissed: false,
  isIos: false,
  hasDeferredPrompt: false,
};

describe("resolveInstallAction", () => {
  test("is hidden when the browser cannot offer Install and it is not iOS", () => {
    expect(resolveInstallAction(NOTHING_APPLIES)).toBe("hidden");
  });

  test("uses the native prompt when Chromium deferred one", () => {
    expect(
      resolveInstallAction({ ...NOTHING_APPLIES, hasDeferredPrompt: true }),
    ).toBe("native-prompt");
  });

  test("shows Add to Home Screen instructions on iOS", () => {
    expect(resolveInstallAction({ ...NOTHING_APPLIES, isIos: true })).toBe(
      "ios-instructions",
    );
  });

  test("is hidden when Installed, even if the browser could still prompt", () => {
    expect(
      resolveInstallAction({
        ...NOTHING_APPLIES,
        isInstalled: true,
        hasDeferredPrompt: true,
      }),
    ).toBe("hidden");
    expect(
      resolveInstallAction({
        ...NOTHING_APPLIES,
        isInstalled: true,
        isIos: true,
      }),
    ).toBe("hidden");
  });

  test("stays hidden after the User dismissed Install in this browser", () => {
    expect(
      resolveInstallAction({
        ...NOTHING_APPLIES,
        isDismissed: true,
        hasDeferredPrompt: true,
      }),
    ).toBe("hidden");
    expect(
      resolveInstallAction({
        ...NOTHING_APPLIES,
        isDismissed: true,
        isIos: true,
      }),
    ).toBe("hidden");
  });
});

describe("shouldShowInstall", () => {
  test("is true whenever an Install action applies", () => {
    expect(
      shouldShowInstall({ ...NOTHING_APPLIES, hasDeferredPrompt: true }),
    ).toBe(true);
    expect(shouldShowInstall({ ...NOTHING_APPLIES, isIos: true })).toBe(true);
  });

  test("is false when Install is hidden", () => {
    expect(shouldShowInstall(NOTHING_APPLIES)).toBe(false);
    expect(shouldShowInstall({ ...NOTHING_APPLIES, isInstalled: true })).toBe(
      false,
    );
  });
});
