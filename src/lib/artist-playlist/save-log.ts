export type SaveLogFields = Record<string, string | number | boolean | null>;

export type SaveLogger = (event: string, fields?: SaveLogFields) => void;

export function createSaveLogger(artistId: string): SaveLogger {
  const startedAt = Date.now();

  return (event, fields = {}) => {
    console.info("[artist-playlist]", {
      event,
      artistId,
      elapsedMs: Date.now() - startedAt,
      ...fields,
    });
  };
}

export function shouldLogTick(
  loaded: number,
  total: number,
  step: number,
): boolean {
  if (loaded === 0 || loaded === 1 || loaded === total) {
    return true;
  }

  return step > 0 && loaded % step === 0;
}
