CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"author" text,
	"format" text NOT NULL,
	"id_from_storage" text NOT NULL UNIQUE,
	"file_path" text NOT NULL,
	"cover_url" text,
	"file_size" integer,
	"total_pages" integer,
	"uploaded_at" timestamp DEFAULT now(),
	"last_opened_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reading_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"book_id" uuid NOT NULL,
	"location" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_book_id_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE;