import "server-only";

import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
import {
  account,
  authRelations,
  session,
  user,
  verification,
} from "./auth-schema";

const relations = defineRelations(
  { user, session, account, verification },
  () => ({}),
);

export const db = drizzle(env.DATABASE_URL, {
  relations: { ...relations, ...authRelations },
});
