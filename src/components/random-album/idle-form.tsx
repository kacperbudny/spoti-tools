"use client";

import { RandomAlbumStage } from "@/components/random-album/stage";
import { useRandomAlbumIdleForm } from "@/components/random-album/use-random-album-idle-form";

export function RandomAlbumIdleForm() {
  const {
    selection,
    currentPick,
    progress,
    errorMessage,
    isLoading,
    handleToggle,
    handleDraw,
  } = useRandomAlbumIdleForm();

  return (
    <RandomAlbumStage
      selection={selection}
      pick={currentPick}
      progress={progress}
      errorMessage={errorMessage}
      isLoading={isLoading}
      onToggle={handleToggle}
      onDraw={handleDraw}
    />
  );
}
