import { integer, text, timestamp, uuid, pgTable } from "drizzle-orm/pg-core";

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  format: text("format", { enum: ["pdf", "epub"] }).notNull(),
  id_from_storage: text('id_from_storage').notNull().unique(),
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
