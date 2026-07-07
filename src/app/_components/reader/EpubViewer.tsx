"use client";

import { useEffect, useRef, useState } from "react";
import ePub from "epubjs";
import type { Book, Rendition, Location, Contents } from "epubjs";
import { useKeyPress } from "@/app/_lib/hooks/useKeyPress";

interface EpubViewerProps {
  url: string;
}

export default function EpubViewer({ url }: EpubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);

  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    let cancelled = false;

    async function loadBook() {
      try {
        setLoading(true);
        setError("");

        // Download the epub
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch EPUB (${response.status})`);
        }

        const buffer = await response.arrayBuffer();

        if (cancelled) return;

        // Open from binary data
        const book = ePub(buffer);
        const rendition = book.renderTo(viewer!, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: "none",
        });

        rendition.hooks.content.register((contents: Contents) => {
          contents.document.querySelectorAll("span.italic").forEach((el) => {
            if (el.textContent?.trim().match(/^Page\s+\d+$/)) {
              el.remove();
            }
          });
        });

        bookRef.current = book;
        renditionRef.current = rendition;

        rendition.on("relocated", (location: Location) => {
          console.log("Current CFI:", location.start.cfi);
        });

        await rendition.display();

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      cancelled = true;

      renditionRef.current?.destroy();
      bookRef.current?.destroy();

      renditionRef.current = null;
      bookRef.current = null;
    };
  }, [url]);

  const goToPrevPage = () => renditionRef.current?.prev();

  const goToNextPage = () => renditionRef.current?.next();

  useKeyPress("ArrowLeft", goToPrevPage, true);
  useKeyPress("ArrowRight", goToNextPage, true);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex gap-2 border-b p-2">
        <button onClick={goToPrevPage} className="rounded border px-3 py-1">
          Previous
        </button>

        <button onClick={goToNextPage} className="rounded border px-3 py-1">
          Next
        </button>

        {loading && <span>Loading...</span>}

        {error && <span className="text-red-500">{error}</span>}
      </div>

      <div ref={viewerRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
