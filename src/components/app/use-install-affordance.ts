"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  getServerDeferredInstallPrompt,
  subscribeDeferredInstallPrompt,
} from "@/lib/install/deferred-install-prompt";
import { resolveInstallAction } from "@/lib/install/install-action";
import {
  getIsDismissed,
  getIsInstalled,
  getIsIos,
  getServerIsDismissed,
  getServerIsInstalled,
  getServerIsIos,
  subscribeIsDismissed,
  subscribeIsInstalled,
  subscribeIsIos,
  writeDismissed,
} from "@/lib/install/install-environment";

export function useInstallAffordance() {
  const [installedThisSession, setInstalledThisSession] = useState(false);
  const [dismissedThisSession, setDismissedThisSession] = useState(false);
  const [isIosInstructionsOpen, setIsIosInstructionsOpen] = useState(false);
  const isInstalledEnvironment = useSyncExternalStore(
    subscribeIsInstalled,
    getIsInstalled,
    getServerIsInstalled,
  );
  const isIos = useSyncExternalStore(subscribeIsIos, getIsIos, getServerIsIos);
  const isDismissedStored = useSyncExternalStore(
    subscribeIsDismissed,
    getIsDismissed,
    getServerIsDismissed,
  );
  const deferredPrompt = useSyncExternalStore(
    subscribeDeferredInstallPrompt,
    getDeferredInstallPrompt,
    getServerDeferredInstallPrompt,
  );
  const isInstalled = isInstalledEnvironment || installedThisSession;
  const isDismissed = isDismissedStored || dismissedThisSession;

  useEffect(() => {
    function handleAppInstalled() {
      setInstalledThisSession(true);
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
      await deferredPrompt.userChoice;
      clearDeferredInstallPrompt();
    }
  }

  function handleDismiss() {
    writeDismissed();
    setDismissedThisSession(true);
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
