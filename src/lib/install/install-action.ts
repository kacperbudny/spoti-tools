export type InstallSignals = {
  /** Already on the home screen, or running from that entry in standalone. */
  isInstalled: boolean;
  /** The User dismissed Install in this browser. */
  isDismissed: boolean;
  /** iOS device: no native prompt API, Add to Home Screen instructions apply. */
  isIos: boolean;
  /** Chromium captured a `beforeinstallprompt` event we can replay. */
  hasDeferredPrompt: boolean;
};

export type InstallAction = "native-prompt" | "ios-instructions" | "hidden";

export function resolveInstallAction(signals: InstallSignals): InstallAction {
  if (signals.isInstalled || signals.isDismissed) {
    return "hidden";
  }

  if (signals.hasDeferredPrompt) {
    return "native-prompt";
  }

  if (signals.isIos) {
    return "ios-instructions";
  }

  return "hidden";
}

export function shouldShowInstall(signals: InstallSignals): boolean {
  return resolveInstallAction(signals) !== "hidden";
}
