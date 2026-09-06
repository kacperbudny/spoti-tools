"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  getServerDeferredInstallPrompt,
  subscribeDeferredInstallPrompt,
} from "@/lib/install/deferred-install-prompt";
import { resolveInstallAction } from "@/lib/install/install-action";

export function useInstallAffordance() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIosInstructionsOpen, setIsIosInstructionsOpen] = useState(false);
  const deferredPrompt = useSyncExternalStore(
    subscribeDeferredInstallPrompt,
    getDeferredInstallPrompt,
    getServerDeferredInstallPrompt,
  );

  useEffect(() => {
    setIsInstalled(readIsInstalled());
    setIsIos(readIsIos());
    setIsDismissed(readIsDismissed());

    function handleAppInstalled() {
      setIsInstalled(true);
      clearDeferredInstallPrompt();
    }

    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
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
      clearDeferredInstallPrompt();
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
    }
  }

  function handleDismiss() {
    writeDismissed();
    setIsDismissed(true);
  }

  function handleIosInstructionsOpenChange(open: boolean) {
    setIsIosInstructionsOpen(open);
  }

  return {
    action,
    isIosInstructionsOpen,
    handleInstall,
    handleDismiss,
    handleIosInstructionsOpenChange,
  };
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
