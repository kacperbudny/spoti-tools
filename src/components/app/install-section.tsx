"use client";

import { MonitorDown, Share } from "lucide-react";
import { useInstallAffordance } from "@/components/app/use-install-affordance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
      className="flex w-full flex-col gap-3"
    >
      <h2 id="install-heading" className="text-lg font-medium">
        {INSTALL_HEADING}
      </h2>
      <Card>
        <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 py-2 md:gap-x-6 md:py-6">
          <InstallGlyph className="row-span-2 size-12 md:size-16 [&_svg]:size-5 md:[&_svg]:size-7" />
          <CardTitle className="text-xl tracking-tight md:text-2xl">
            Install as an app
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            {INSTALL_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardFooter className="gap-2 border-t">
          <Button type="button" onClick={handleInstall}>
            Install SpotiTools
          </Button>
          <Button type="button" variant="ghost" onClick={handleDismiss}>
            Hide
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

export function InstallNavFooter() {
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
    <div className="flex flex-col gap-2 rounded-2xl bg-sidebar-accent p-2.5 ring-1 ring-cta/20">
      <div className="flex gap-2">
        <InstallGlyph className="size-8 [&_svg]:size-3.5" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-heading text-sm font-medium tracking-tight">
            Install as an app
          </p>
          <p className="text-xs leading-snug text-muted-foreground">
            {INSTALL_NAV_DESCRIPTION}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          size="sm"
          className="w-full"
          onClick={handleInstall}
        >
          Install
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="w-full text-muted-foreground"
        >
          Hide
        </Button>
      </div>
      {action === "ios-instructions" ? (
        <IosInstructionsDialog
          open={isIosInstructionsOpen}
          onOpenChange={handleIosInstructionsOpenChange}
        />
      ) : null}
    </div>
  );
}

const INSTALL_HEADING = "Install";
const INSTALL_DESCRIPTION =
  "Add SpotiTools to your home screen and use it as an application.";
const INSTALL_NAV_DESCRIPTION = "Add it to your home screen.";

function InstallGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-cta/15 text-cta",
        className,
      )}
    >
      <MonitorDown />
    </span>
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
