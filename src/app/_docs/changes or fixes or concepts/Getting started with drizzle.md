# Getting Started with Drizzle

## Installation

```bash
pnpm add drizzle-orm@rc postgres dotenv
pnpm add -D drizzle-kit@rc tsx
```

## Setup connection string

I have used supabase as database for this project. You can find the connection string directly on the project homepage. If it didn't work you can click on the `connect` tab on the top banner and select `ORM` than `drizzle` and get the key from there.

**Top banner** > **connect** > **ORM** > **Drizzle**

You can paste this string to your `env` file under `DATABASE_URL`.

## Create schema

The preferred folder for schema is `_db/schema.ts`. You can create it anywhere you want to.

```ts
// _db/schema.ts
import { integer, text, timestamp, uuid, pgTable } from "drizzle-orm/pg-core";

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  format: text("format", { enum: ["pdf", "epub"] }).notNull(),
  file_path: text("file_path").notNull(), // path in Supabase Storage
  cover_url: text("cover_url"), // optional extracted cover
  file_size: integer("file_size"), // in bytes
  total_pages: integer("total_pages"), // useful for progress %
  uploaded_at: timestamp("uploaded_at").defaultNow(),
  last_opened_at: timestamp("last_opened_at"),
});

export const readingProgress = pgTable("reading_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  book_id: uuid("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  location: text("location").notNull(), // page number (PDF) or CFI string (EPUB)
  updated_at: timestamp("updated_at").defaultNow(),
});
```

## Connect Drizzle ORM to Supabase

We will create a `db.ts` file under `lib` folder for this. If we need to connect to db this is from where we do it.

```ts
// /lib/db.ts
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing environment variable: DATABASE_URL");
}

export const db = drizzle({
  connection: connectionString,
});
```

## Create a config file for Drizzle

We will create a config file (`config.drizzle.ts`) for Drizzle so that we can migrate our schema to supabase.

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/app/_db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

It should be created at the project root. As we are outside nextjs app we will need `dotenv` for reading `env` variables.

## Create migrations and send them to Supabase

First we will create migrations in our local system and than send those migrations over to supabase.

### Creating migrations

```bash
npx drizzle-kit generate
```

This will create a migration under `drizzle` folder at project root.

### Run the migration on Supabase

```bash
npx drizzle-kit migrate
```

Drizzle will connect to your supabase database and execute the sql.

If for any reason it doesn't work, the most probable cause is URL. Instead of the URL given in project homepage, take from the connect tab.
