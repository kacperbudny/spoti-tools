import { afterEach, describe, expect, test } from "bun:test";
import { resolveInstallAction } from "@/lib/install/install-action";
import {
  getIsDismissed,
  getIsInstalled,
  getIsIos,
  getServerIsDismissed,
  getServerIsInstalled,
  getServerIsIos,
  writeDismissed,
} from "@/lib/install/install-environment";

const originalUserAgent = navigator.userAgent;
const originalMaxTouchPoints = navigator.maxTouchPoints;
const originalStandalone = Object.getOwnPropertyDescriptor(
  navigator,
  "standalone",
);
const originalWindow = globalThis.window;
const originalLocalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  "localStorage",
);

afterEach(() => {
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: originalUserAgent,
  });
  Object.defineProperty(navigator, "maxTouchPoints", {
    configurable: true,
    value: originalMaxTouchPoints,
  });
  if (originalStandalone) {
    Object.defineProperty(navigator, "standalone", originalStandalone);
  } else {
    Reflect.deleteProperty(navigator, "standalone");
  }

  if (originalWindow === undefined) {
    Reflect.deleteProperty(globalThis, "window");
  } else {
    globalThis.window = originalWindow;
  }

  if (originalLocalStorage) {
    Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
  } else {
    Reflect.deleteProperty(globalThis, "localStorage");
  }
});

describe("install environment snapshots", () => {
  test("server snapshots do not claim Installed, iOS, or dismissed", () => {
    expect(getServerIsInstalled()).toBe(false);
    expect(getServerIsIos()).toBe(false);
    expect(getServerIsDismissed()).toBe(false);
  });

  test("client snapshot is Installed in standalone display mode", () => {
    stubWindow({ standalone: true });
    expect(getIsInstalled()).toBe(true);
  });

  test("client snapshot is Installed on iOS standalone", () => {
    stubWindow({ standalone: false });
    Object.defineProperty(navigator, "standalone", {
      configurable: true,
      value: true,
    });
    expect(getIsInstalled()).toBe(true);
  });

  test("client snapshot is iOS for iPhone", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });
    expect(getIsIos()).toBe(true);
  });

  test("client snapshot is iOS for iPadOS desktop mode", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    });
    Object.defineProperty(navigator, "maxTouchPoints", {
      configurable: true,
      value: 5,
    });
    expect(getIsIos()).toBe(true);
  });

  test("client snapshot is dismissed after the User dismisses Install", () => {
    stubLocalStorage();
    expect(getIsDismissed()).toBe(false);
    writeDismissed();
    expect(getIsDismissed()).toBe(true);
  });

  test("client Installed snapshot hides Install even when a deferred prompt exists", () => {
    stubWindow({ standalone: true });
    stubLocalStorage();
    expect(
      resolveInstallAction({
        isInstalled: getIsInstalled(),
        isIos: getIsIos(),
        isDismissed: getIsDismissed(),
        hasDeferredPrompt: true,
      }),
    ).toBe("hidden");
  });

  test("client dismissed snapshot hides Install even when a deferred prompt exists", () => {
    stubWindow({ standalone: false });
    stubLocalStorage();
    writeDismissed();
    expect(
      resolveInstallAction({
        isInstalled: getIsInstalled(),
        isIos: getIsIos(),
        isDismissed: getIsDismissed(),
        hasDeferredPrompt: true,
      }),
    ).toBe("hidden");
  });
});

function stubWindow({ standalone }: { standalone: boolean }) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: {
      matchMedia(query: string) {
        return {
          matches: standalone && query === "(display-mode: standalone)",
          addEventListener() {},
          removeEventListener() {},
        };
      },
      addEventListener() {},
      removeEventListener() {},
    },
  });
}

function stubLocalStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        store.set(key, value);
      },
    },
  });
}
