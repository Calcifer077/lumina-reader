// app/book/[bookId]/page.tsx

import { getBook } from "@/app/_lib/books";
import BookPageView from "@/app/_components/book/BookPageView";

type Props = {
  params: Promise<{ bookId: string }>;
};

export default async function BookPage({ params }: Props) {
  // Await the params to get the bookId
  const { bookId } = await params;
  const book = await getBook(bookId);

  return (
    <div className="px-2 py-4 lg:px-6 lg:py-8 mb-12">
      <BookPageView book={book} />
    </div>
  );
}
