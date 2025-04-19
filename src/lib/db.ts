import { env } from "@/env";
import * as schema from "@/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle({ client, schema, casing: "snake_case" });
