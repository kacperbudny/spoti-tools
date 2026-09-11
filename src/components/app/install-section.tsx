"use client";

import { Share } from "lucide-react";
import { useInstallAffordance } from "@/components/app/use-install-affordance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function InstallSection() {
  const {
    action,
    isIosInstructionsOpen,
    handleInstall,
    handleDismiss,
    handleIosInstructionsOpenChange,
  } = useInstallAffordance();

  if (action === "hidden") {
    return null;
  }

  return (
    <section
      aria-labelledby="install-heading"
      className="flex w-full max-w-lg flex-col gap-3"
    >
      <h2 id="install-heading" className="text-lg font-medium">
        Install
      </h2>
      <Card size="sm">
        <CardContent>
          <p>Add SpotiTools to your home screen to use it as an app.</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button type="button" variant="secondary" onClick={handleInstall}>
            Install SpotiTools
          </Button>
          <Button type="button" variant="ghost" onClick={handleDismiss}>
            Not now
          </Button>
        </CardFooter>
      </Card>

      {action === "ios-instructions" ? (
        <IosInstructionsDialog
          open={isIosInstructionsOpen}
          onOpenChange={handleIosInstructionsOpenChange}
        />
      ) : null}
    </section>
  );
}

type IosInstructionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function IosInstructionsDialog({
  open,
  onOpenChange,
}: IosInstructionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Home Screen</DialogTitle>
          <DialogDescription>
            iOS has no install button, so it takes three taps in the browser.
          </DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Tap Share{" "}
            <Share aria-hidden className="inline size-4 align-text-bottom" /> in
            the browser toolbar.
          </li>
          <li>Scroll down and tap Add to Home Screen.</li>
          <li>Tap Add.</li>
        </ol>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
