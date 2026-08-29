export type Person = "visitor" | "user";
export type Surface = "landing" | "dashboard";

export const SURFACE_PATH = {
  landing: "/",
  dashboard: "/app",
} as const;

export function redirectFor(person: Person, opened: Surface): Surface | null {
  if (person === "user" && opened === "landing") {
    return "dashboard";
  }
  if (person === "visitor" && opened === "dashboard") {
    return "landing";
  }
  return null;
}
