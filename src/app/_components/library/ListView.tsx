import Image from "next/image";
import Link from "next/link";

import type { BookFromApi } from "@/app/_lib/types";

export default async function ListView({
  booksPromise,
  sort,
}: {
  booksPromise: Promise<BookFromApi[]>;
  sort: string;
}) {
  const books = await booksPromise;

  const filteredBooks =
    sort === "pdf"
      ? books.filter((b) => b.format === "pdf")
      : sort === "epub"
        ? books.filter((b) => b.format === "epub")
        : books;

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sort) {
      case "recently_added":
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

      case "recently_opened":
        return (
          new Date(b.lastOpenedAt ?? "1970-01-01").getTime() -
          new Date(a.lastOpenedAt ?? "1970-01-01").getTime()
        );

      case "title_a-z":
        return a.title.localeCompare(b.title);

      case "title_z-a":
        return b.title.localeCompare(a.title);

      default:
        return 0;
    }
  });

  return (
    <div className="w-full">
      {/* Desktop Header */}
      <div className="hidden md:grid grid-cols-[1fr_120px_100px_140px] items-center gap-4 border-b border-border pb-3 mb-2">
        <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
          Book details
        </span>
        <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
          Format
        </span>
        <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
          File size
        </span>
        <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
          Last added
        </span>
      </div>

      <div className="divide-y divide-border">
        {sortedBooks.map((book) => (
          <Link
            href={`/book/${book.id}`}
            key={book.id}
            className="
            group
            flex flex-col gap-3 py-4
            hover:bg-accent/60 transition-colors cursor-pointer

            md:grid md:grid-cols-[1fr_120px_100px_140px]
            md:items-center md:gap-4
            md:px-2 md:-mx-2 md:rounded-sm
          "
          >
            {/* Book */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-surface-container-high">
                <Image
                  src={book.coverUrl}
                  alt={`${book.title} cover`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {book.title}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {book.author}
                </p>
              </div>
            </div>

            {/* Mobile metadata */}
            <div className="flex items-center flex-wrap gap-2 md:hidden">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs ${
                  book.format === "pdf"
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "bg-secondary-container text-on-secondary-container"
                }`}
              >
                {book.format.toUpperCase()}
              </span>

              <span className="text-sm text-muted-foreground">
                {book.fileSize}
              </span>

              <span className="text-sm text-muted-foreground">
                {book.uploadedAt}
              </span>
            </div>

            {/* Desktop columns */}
            <div className="hidden md:block">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-label-sm ${
                  book.format === "pdf"
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "bg-secondary-container text-on-secondary-container"
                }`}
              >
                {book.format}
              </span>
            </div>

            <span className="hidden md:block text-body-sm text-on-surface-variant">
              {book.fileSize} MB
            </span>

            <span className="hidden md:block text-body-sm text-on-surface-variant">
              {book.uploadedAt}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
