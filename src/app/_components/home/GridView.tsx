import Image from "next/image";

import { Book } from "@/app/_lib/types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function GridView({ books }: { books: Book[] }) {
  // Simulate an async operation (e.g. fetching books)
  await delay(3000);

  return (
    <div className="grid grid-cols-4 gap-4">
      {books.map((book) => (
        <div key={book.id} className="group mb-8 w-full">
          <div className="aspect-4/5 w-full relative rounded-xl overflow-hidden">
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
            />
            <div
              className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-label-sm font-label uppercase tracking-wide ${
                book.format === "pdf"
                  ? "bg-tertiary-container text-on-tertiary-container"
                  : "bg-secondary-container text-on-secondary-container"
              }`}
            >
              {book.format}
            </div>
            {book.progress > 0 && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-container-highest">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${book.progress * 100}%` }}
                />
              </div>
            )}
          </div>
          <div className="h-6 w-full mt-2 text-foreground font-bold capitalize truncate transition-colors group-hover:text-primary cursor-pointer">
            {book.title}
          </div>
          <div className="h-4 mt-2 text-on-surface-variant text-body-sm">
            {book.author}
          </div>
        </div>
      ))}
    </div>
  );
}
