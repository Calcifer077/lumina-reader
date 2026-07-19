"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useGesture } from "@use-gesture/react";
import ePub from "epubjs";
import type { Book, Contents, Location, Rendition } from "epubjs";
import { ArrowDown, ArrowUp } from "lucide-react";

import { useKeyPress } from "@/app/_lib/hooks/useKeyPress";

interface EpubViewerProps {
  bookId: string;
  url: string;
  location: string | null;
}

const MIN_SCALE = 50;
const MAX_SCALE = 200;
const SCALE_STEP = 5;

export default function EpubViewer({ bookId, url, location }: EpubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);

  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedLocationRef = useRef<string | null>(null);

  // Keep a ref of the current zoom so gesture callbacks (which close over
  // stale state otherwise) always read the latest value.
  const zoomRef = useRef<number>(100);
  const pinchStartZoomRef = useRef<number>(100);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [saving, setSaving] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const applyZoom = useCallback((value: number) => {
    const rendition = renditionRef.current;
    if (!rendition) return;
    rendition.themes.fontSize(value + "%");
  }, []);

  const setZoomClamped = useCallback(
    (value: number) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(value)));
      zoomRef.current = next;
      setZoom(next);
      applyZoom(next);
      return next;
    },
    [applyZoom],
  );

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
          }, 2000);
        });

        if (location) {
          await rendition.display(location);
        } else {
          await rendition.display();
        }

        // Apply whatever zoom level is currently set once the book renders.
        applyZoom(zoomRef.current);

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
  }, [url, location, bookId, applyZoom]);

  const goToPrevPage = () => renditionRef.current?.prev();
  const goToNextPage = () => renditionRef.current?.next();

  const handleZoomNeg = () => setZoomClamped(zoomRef.current - SCALE_STEP);
  const handleZoomPos = () => setZoomClamped(zoomRef.current + SCALE_STEP);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;

    if (ratio < 0.3) {
      goToPrevPage();
    } else if (ratio > 0.7) {
      goToNextPage();
    }
  };

  useKeyPress("ArrowLeft", goToPrevPage, true);
  useKeyPress("ArrowRight", goToNextPage, true);

  // Pinch-to-zoom via @use-gesture/react. `offset[0]` is the cumulative
  // scale factor use-gesture tracks internally across the gesture.
  const bind = useGesture(
    {
      onPinchStart: () => {
        pinchStartZoomRef.current = zoomRef.current;
      },
      onPinch: ({ offset: [scale] }) => {
        setZoomClamped(pinchStartZoomRef.current * scale);
      },
      onWheel: ({ event, ctrlKey, delta: [, dy] }) => {
        // Support ctrl/cmd + wheel (trackpad pinch on most browsers fires
        // wheel with ctrlKey true) as a zoom gesture too.
        if (!ctrlKey) return;
        event.preventDefault();
        setZoomClamped(zoomRef.current - dy * 0.5);
      },
    },
    {
      pinch: {
        scaleBounds: { min: MIN_SCALE / 100, max: MAX_SCALE / 100 },
        rubberband: true,
      },
      wheel: { eventOptions: { passive: false } },
    },
  );

  return (
    <div className="relative flex flex-col h-dvh w-full bg-background text-foreground">
      {isVisible && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-container-lowest p-2 sm:gap-3 sm:p-3 shadow-sm">
          <div className="flex gap-2">
            <button
              onClick={goToPrevPage}
              className="rounded-md border border-border bg-surface px-2 py-1 text-label-sm font-label text-on-surface transition-colors hover:bg-surface-high sm:px-3 sm:text-label-md"
            >
              Previous
            </button>

            <button
              onClick={goToNextPage}
              className="rounded-md border border-border bg-surface px-2 py-1 text-label-sm font-label text-on-surface transition-colors hover:bg-surface-high sm:px-3 sm:text-label-md"
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-surface-container p-1 sm:gap-2">
            <button
              onClick={handleZoomNeg}
              aria-label="Zoom out"
              className="rounded-full px-2 py-1 text-label-sm font-label text-on-surface-variant transition-colors hover:bg-surface-high hover:text-on-surface sm:px-3 sm:text-label-md"
            >
              − Zoom out
            </button>

            <span className="min-w-14 text-center text-label-sm tabular-nums text-on-surface-variant sm:text-label-md">
              {zoom}%
            </span>

            <button
              onClick={handleZoomPos}
              aria-label="Zoom in"
              className="rounded-full px-2 py-1 text-label-sm font-label text-on-surface-variant transition-colors hover:bg-surface-high hover:text-on-surface sm:px-3 sm:text-label-md"
            >
              + Zoom in
            </button>
          </div>

          <div className="hidden md:flex ml-auto items-center gap-3 text-body-sm font-body">
            {loading && (
              <span className="text-on-surface-variant">Loading...</span>
            )}
            {error && <span className="text-error">{error}</span>}
            {saving && (
              <span className="text-on-surface-variant">Syncing...</span>
            )}
            {syncError && <span className="text-error">{syncError}</span>}
          </div>

          <button
            onClick={() => setIsVisible(false)}
            aria-label="Hide toolbar"
            className="absolute right-0 rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-high hover:text-on-surface"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      )}

      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          aria-label="Show toolbar"
          className="absolute left-1/2 top-1 z-50 -translate-x-1/2 rounded-full bg-surface-container-lowest p-1.5 text-on-surface-variant shadow-md transition-colors hover:bg-surface-high hover:text-on-surface"
        >
          <ArrowDown size={18} />
        </button>
      )}

      <div className="relative flex-1 overflow-hidden bg-surface">
        <div
          ref={viewerRef}
          className="absolute bottom-0 left-0 right-0 top-4"
        />

        <div
          {...bind()}
          onClick={handleOverlayClick}
          className="absolute inset-0 touch-none"
          style={{ zIndex: 10 }}
        />
      </div>
    </div>
  );
}
