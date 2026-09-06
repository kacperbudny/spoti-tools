"use client";

import { useEffect, useState } from "react";
import { resolveInstallAction } from "@/lib/install/install-action";

export function useInstallAffordance() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIosInstructionsOpen, setIsIosInstructionsOpen] = useState(false);

  useEffect(() => {
    setIsInstalled(readIsInstalled());
    setIsIos(readIsIos());
    setIsDismissed(readIsDismissed());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      if (isBeforeInstallPromptEvent(event)) {
        setDeferredPrompt(event);
      }
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const action = resolveInstallAction({
    isInstalled,
    isDismissed,
    isIos,
    hasDeferredPrompt: deferredPrompt !== null,
  });

  async function handleInstall() {
    if (action === "ios-instructions") {
      setIsIosInstructionsOpen(true);
      return;
    }

    if (action === "native-prompt" && deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      // A deferred prompt can only be replayed once.
      setDeferredPrompt(null);
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
    }
  }

  function handleDismiss() {
    writeDismissed();
    setIsDismissed(true);
  }

  return {
    action,
    isIosInstructionsOpen,
    setIsIosInstructionsOpen,
    handleInstall,
    handleDismiss,
  };
}

/** Chromium-only, not in lib.dom. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isBeforeInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return "prompt" in event && typeof event.prompt === "function";
}

const DISMISSED_STORAGE_KEY = "spotitools.install.dismissed:v1";

function readIsInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone === true)
  );
}

function readIsIos(): boolean {
  const userAgent = navigator.userAgent;
  const isIpadOsDesktopMode =
    userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(userAgent) || isIpadOsDesktopMode;
}

function readIsDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDismissed() {
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, "1");
  } catch {
    // Private browsing or storage disabled: dismiss lasts for this page only.
  }
}
