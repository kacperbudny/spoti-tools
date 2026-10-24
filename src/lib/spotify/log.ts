import { HTTPError } from "ky";

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
