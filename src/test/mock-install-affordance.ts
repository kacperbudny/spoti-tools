import { mock } from "bun:test";

/** Visible Install UI in component tests without mocking `@/lib/install/install-action`. */
export function mockInstallAffordance() {
  mock.module("@/components/app/use-install-affordance", () => ({
    useInstallAffordance: () => ({
      action: "native-prompt" as const,
      isIosInstructionsOpen: false,
      handleInstall: () => {},
      handleDismiss: () => {},
      handleIosInstructionsOpenChange: () => {},
    }),
  }));
}
