import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import * as z from "zod";

config({ path: ".env.local" });

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
  },
  experimental__runtimeEnv: {},
  emptyStringAsUndefined: true,
});
