// _app/reader/[bookId]
import { notFound } from "next/navigation";

import PdfViewer from "@/app/_components/reader/PdfViewer";
import EpubViewer from "@/app/_components/reader/EpubViewer";

import { getProgress } from "@/app/_lib/progress";
import { getFormatAndSignedUrl } from "@/app/_lib/books";

// get params from url
type Props = {
  params: Promise<{ bookId: string }>;
};

export default async function ReaderPage({ params }: Props) {
  const { bookId } = await params;

  const res = await getFormatAndSignedUrl(bookId);
  const progress = await getProgress(bookId);

  if (!res) notFound();

  const { signedUrl, format } = res;

  // can't find the url, we also have a 'not-found' page at this layout.
  if (signedUrl === null) notFound();

  return (
    <div className="w-full min-h-dvh overflow-hidden bg-background">
      {format === "pdf" && (
        <PdfViewer
          bookUrl={signedUrl}
          bookId={bookId}
          // If the user never read it, we will start from the first page
          initialPage={progress ? Number(progress.location) : 1}
        />
      )}
      {format === "epub" && (
        <EpubViewer
          bookId={bookId}
          url={signedUrl}
          location={progress ? progress.location : null}
        />
      )}
    </div>
  );
}
