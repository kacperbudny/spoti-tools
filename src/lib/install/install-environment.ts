/**
 * Browser signals for the Dashboard Install affordance. Snapshots are read by
 * `useSyncExternalStore` so SSR/hydration stay on the server values, then the
 * client values apply together — not one effect later than the deferred prompt.
 */

const STANDALONE_MEDIA = "(display-mode: standalone)";
const DISMISSED_STORAGE_KEY = "spotitools.install.dismissed:v1";

export function getServerIsInstalled(): boolean {
  return false;
}

export function getServerIsIos(): boolean {
  return false;
}

export function getServerIsDismissed(): boolean {
  return false;
}

export function getIsInstalled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia(STANDALONE_MEDIA).matches ||
    ("standalone" in navigator && navigator.standalone === true)
  );
}

export function getIsIos(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  const isIpadOsDesktopMode =
    userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(userAgent) || isIpadOsDesktopMode;
}

export function getIsDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeDismissed() {
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, "1");
  } catch {
    // Private browsing or storage disabled: dismiss lasts for this page only.
  }
}

export function subscribeIsInstalled(onStoreChange: () => void) {
  const media = window.matchMedia(STANDALONE_MEDIA);
  media.addEventListener("change", onStoreChange);
  return () => {
    media.removeEventListener("change", onStoreChange);
  };
}

export function subscribeIsIos(_onStoreChange: () => void) {
  return () => {};
}

export function subscribeIsDismissed(onStoreChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === DISMISSED_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("storage", onStorage);
  };
}
