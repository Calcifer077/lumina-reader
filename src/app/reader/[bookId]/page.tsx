import PdfViewer from "@/app/_components/reader/PdfViewer";
import { getSignedUrlForBook } from "@/app/_lib/books";
import { getProgress } from "@/app/_lib/progress";

type Props = {
  params: Promise<{ bookId: string }>;
};

export default async function ReaderPage({ params }: Props) {
  const { bookId } = await params;

  const bookUrl = await getSignedUrlForBook(bookId);
  const progress = await getProgress(bookId);

  if (bookUrl === null) return null;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div>
        <PdfViewer
          bookUrl={bookUrl}
          bookId={bookId}
          initialPage={progress ? Number(progress.location) : 1}
        />
      </div>
    </div>
  );
}
