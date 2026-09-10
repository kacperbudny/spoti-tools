/**
 * Captures Chromium's `beforeinstallprompt` so the Dashboard can replay it on
 * a User action. Chromium fires it once per page load, possibly on a page
 * without the Install affordance or before React hydrates, so the capture
 * runs at module scope in an always-loaded client module (see
 * `Providers` in the root layout).
 */

/** Chromium-only, not in lib.dom. */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    if (isBeforeInstallPromptEvent(event)) {
      deferredPrompt = event;
      notify();
    }
  });
}

export function subscribeDeferredInstallPrompt(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

export function getServerDeferredInstallPrompt(): null {
  return null;
}

/** A deferred prompt can be replayed once; drop it after use or after Install. */
export function clearDeferredInstallPrompt() {
  if (deferredPrompt === null) {
    return;
  }
  deferredPrompt = null;
  notify();
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function isBeforeInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return "prompt" in event && typeof event.prompt === "function";
}
