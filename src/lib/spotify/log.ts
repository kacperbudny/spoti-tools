import { HTTPError } from "ky";

export const MAX_RATE_LIMIT_WAIT_SECONDS = 5;

export function spotifyPath(requestUrl: string): string {
  try {
    const url = new URL(requestUrl);
    url.searchParams.delete("access_token");
    url.searchParams.delete("token");
    return `${url.pathname}${url.search}`;
  } catch {
    return requestUrl;
  }
}

export function spotifyFailureFields(
  error: unknown,
  method: string,
  requestUrl: string,
  elapsedMs: number,
): Record<string, string | number | null> {
  const path = spotifyPath(requestUrl);

  if (error instanceof HTTPError) {
    return {
      event: "failed",
      method,
      path,
      status: error.response.status,
      retryAfter: error.response.headers.get("retry-after"),
      elapsedMs,
    };
  }

  return {
    event: "failed",
    method,
    path,
    status: null,
    elapsedMs,
    message: error instanceof Error ? error.message : String(error),
  };
}

export function retryAfterSeconds(header: string | null): number | null {
  if (header === null) {
    return null;
  }

  const seconds = Number(header);

  if (!Number.isFinite(seconds) || seconds < 0) {
    return null;
  }

  return seconds;
}

export function longRateLimitWait(header: string | null): number | null {
  const seconds = retryAfterSeconds(header);

  if (seconds === null || seconds <= MAX_RATE_LIMIT_WAIT_SECONDS) {
    return null;
  }

  return seconds;
}

export function rateLimitMessage(seconds: number): string {
  const hours = Math.round(seconds / 3600);

  if (hours >= 1) {
    return `Spotify is rate limiting requests. Try again in about ${hours} ${hours === 1 ? "hour" : "hours"}.`;
  }

  const minutes = Math.max(1, Math.round(seconds / 60));
  return `Spotify is rate limiting requests. Try again in about ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
}
