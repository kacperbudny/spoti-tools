"use client";

// Importing the store starts listening for `beforeinstallprompt` as soon as
// the client bundle loads, on every page. Renders nothing.
import "@/lib/install/deferred-install-prompt";

export function InstallPromptCapture() {
  return null;
}
