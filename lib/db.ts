
import "server-only";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/schema";

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DATABASE_URL is missing or empty");
}

try {
  new URL(connectionString);
} catch {
  throw new Error(
    "DATABASE_URL is malformed. Check the URL in your Vercel environment variables."
  );
}

const client = postgres(connectionString, {
  prepare: false,
  max: 5,
});

export const db = drizzle(client, { schema });
  
