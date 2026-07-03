// /lib/db.ts
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing environment variable: DATABASE_URL");
}

export const db = drizzle({
  connection: connectionString,
});
