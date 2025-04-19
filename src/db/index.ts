import * as authSchema from "@/db/schema/auth-schema";
import { env } from "@/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle({
  client,
  schema: { ...authSchema },
  casing: "snake_case",
});
