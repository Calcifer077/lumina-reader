"use client";

import { useEffect, useRef, useState } from "react";
import ePub from "epubjs";
import type { Book, Rendition, Location, Contents } from "epubjs";
import { useKeyPress } from "@/app/_lib/hooks/useKeyPress";

interface EpubViewerProps {
  bookId: string;
  url: string;
  location: string | null;
}

export default function EpubViewer({ bookId, url, location }: EpubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);

  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [saving, setSaving] = useState<boolean>(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedLocationRef = useRef<string | null>(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    let cancelled = false;

    async function loadBook() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch EPUB (${response.status})`);
        }

        const buffer = await response.arrayBuffer();

        if (cancelled) return;

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

        const saveProgress = async (locationStr: string) => {
          if (locationStr === lastSavedLocationRef.current) {
            return;
          }

          setSaving(true);

          try {
            const res = await fetch(`/api/progress/${bookId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ location: locationStr }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
              setSyncError("There was a problem while syncing.");
              return;
            }

            lastSavedLocationRef.current = locationStr;
          } catch (err) {
            console.error(err);
            setSyncError("There was a problem while syncing.");
          } finally {
            setSaving(false);
          }
        };

        rendition.on("relocated", (location: Location) => {
          const locationStr = location.start.cfi;

          // Skip scheduling entirely if it matches the last saved location
          if (locationStr === lastSavedLocationRef.current) {
            return;
          }

          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }

          saveTimeoutRef.current = setTimeout(() => {
            saveTimeoutRef.current = null;
            if (!cancelled) {
              saveProgress(locationStr);
            }
          }, 2000); // adjust debounce delay as needed
        });

        if (location) {
          await rendition.display(location);
        } else {
          await rendition.display();
        }

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

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      renditionRef.current?.destroy();
      bookRef.current?.destroy();

      renditionRef.current = null;
      bookRef.current = null;
    };
  }, [url, location, bookId]);

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

        {saving && <span>Syncing...</span>}
        {syncError && <span>{syncError}</span>}
      </div>

      <div ref={viewerRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
