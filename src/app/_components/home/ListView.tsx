import Image from "next/image";

import { Book } from "@/app/_lib/types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function ListView({ books }: { books: Book[] }) {
  // await delay(3000);

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_120px_100px_140px] items-center gap-4 pb-3 mb-2 border-b border-border">
        <span className="text-label-sm font-label uppercase tracking-wide text-muted-foreground">
          Book details
        </span>
        <span className="text-label-sm font-label uppercase tracking-wide text-muted-foreground">
          Format
        </span>
        <span className="text-label-sm font-label uppercase tracking-wide text-muted-foreground">
          File size
        </span>
        <span className="text-label-sm font-label uppercase tracking-wide text-muted-foreground">
          Last added
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {books.map((book) => (
          <div
            key={book.id}
            className="group grid grid-cols-[1fr_120px_100px_140px] items-center gap-4 py-3 -mx-2 px-2 rounded-sm hover:bg-accent/60 transition-colors cursor-pointer"
          >
            {/* Book details: cover, title, author */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-sm bg-surface-container-high">
                <Image
                  src={book.coverUrl}
                  alt={`${book.title} cover`}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-body-lg font-heading font-medium text-foreground">
                  {book.title}
                </span>
                <span className="truncate text-label-sm font-body text-muted-foreground">
                  {book.author}
                </span>
              </div>
            </div>

            {/* Format */}
            <div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-label ${
                  book.format === "pdf"
                    ? "bg-tertiary-container text-on-tertiary-container"
                    : "bg-secondary-container text-on-secondary-container"
                }`}
              >
                {book.format}
              </span>
            </div>

            {/* File size */}
            <span className="text-body-sm font-body text-on-surface-variant">
              {book.fileSize} MB
            </span>

            {/* Last added */}
            <span className="text-body-sm font-body text-on-surface-variant">
              {book.uploadedAt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
