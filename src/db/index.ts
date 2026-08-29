import "server-only";

import { drizzle } from "drizzle-orm/neon-http";
import { authRelations } from "@/db/schema";
import { env } from "@/env";

export const db = drizzle(env.DATABASE_URL, {
  relations: authRelations,
});
