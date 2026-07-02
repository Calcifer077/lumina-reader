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
      {books.map((book, index) => (
        <div key={index} className="mb-6 w-full">
          <div className="aspect-4/5 w-full relative">
            <Image
              src={book.image}
              alt={book.title}
              fill
              className="object-cover cursor-pointer"
            />
            <div
              className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-label-sm font-label uppercase tracking-wide ${
                book.type === "pdf"
                  ? "bg-tertiary-container text-on-tertiary-container"
                  : "bg-secondary-container text-on-secondary-container"
              }`}
            >
              {book.type}
            </div>
            {book.progress > 0 && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${book.progress * 100}%` }}
                />
              </div>
            )}
          </div>
          <div className="h-6 w-full mt-2 text-foreground font-bold capitalize">
            {book.title}
          </div>
          <div className="h-4 mt-2 text-on-surface-variant">{book.author}</div>
        </div>
      ))}
    </div>
  );
}
