"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { useGesture } from "@use-gesture/react";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;
const MIN_SWIPE_DISTANCE = 5;

interface PdfViewerProps {
  bookUrl: string;
  bookId: string;
  initialPage: number;
}

export default function PdfViewer({
  bookUrl,
  bookId,
  initialPage = 1,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(1); // Actual PDF render scale
  const [visualScale, setVisualScale] = useState(1); // CSS tranform during pinch
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const lastSavedPage = useRef(initialPage);

  const viewerRef = useRef<HTMLDivElement>(null);

  useGesture(
    {
      onPinch: ({ offset: [d] }) => {
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, d));

        setVisualScale(newScale);
      },

      onPinchEnd: () => {
        setScale(visualScale);
      },

      onDragEnd: ({ movement: [mx], direction: [dx], tap, pinching }) => {
        if (tap || pinching) return;

        if (scale >= 1) return;

        if (Math.abs(mx) < MIN_SWIPE_DISTANCE) return;

        if (dx < 0) {
          // Swipe left -> Next page
          setPageNumber((p) => Math.min(numPages ?? p, p + 1));
        } else {
          // Swipe right -> Previous page
          setPageNumber((p) => Math.max(1, p - 1));
        }
      },
    },
    {
      target: viewerRef,
      eventOptions: {
        passive: false,
      },
      pinch: {
        scaleBounds: {
          min: MIN_SCALE,
          max: MAX_SCALE,
        },
        rubberband: true,
        from: () => [scale, 0],
      },
      drag: {
        filterTaps: true,
        pointer: {
          touch: true,
          mouse: true,
        },
      },
    },
  );

  function onBookLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onBookLoadError(err: Error): void {
    console.error("Failed to load PDF. ", err);
    setError("Failed to load PDF. Please try again.");
  }

  useEffect(() => {
    if (lastSavedPage.current === pageNumber) return;

    async function saveProgress() {
      try {
        setSaving(true);
        setSyncError("");

        const res = await fetch(`/api/progress/${bookId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            location: pageNumber.toString(),
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setSyncError("There was a problem while syncing.");
          return;
        }

        lastSavedPage.current = pageNumber;
      } catch (err) {
        console.error(err);
        setSyncError("There was a problem while syncing.");
      } finally {
        setSaving(false);
      }
    }

    saveProgress();
  }, [pageNumber, bookId]);
  const goToPrevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNextPage = () =>
    setPageNumber((p) => Math.min(numPages || p, p + 1));

  const zoomIn = () =>
    setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)));
  const zoomOut = () =>
    setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)));
  const resetZoom = () => setScale(1);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:sticky top-0 z-999 py-2 px-4 border-b border-border bg-surface/95 backdrop-blur-sm w-full justify-center rounded-b-lg touch-none">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1.5 rounded-md border border-border bg-surface-low text-on-surface text-label-sm font-label
                     hover:bg-surface-high transition-colors
                     disabled:opacity-40 disabled:hover:bg-surface-low"
          >
            ← Prev
          </button>

          <span className="text-body-sm text-on-surface-variant font-body tabular-nums">
            Page {pageNumber} of {numPages || "..."}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="px-3 py-1.5 rounded-md border border-border bg-surface-low text-on-surface text-label-sm font-label
                     hover:bg-surface-high transition-colors
                     disabled:opacity-40 disabled:hover:bg-surface-low"
          >
            Next →
          </button>
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-4">
          <button
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-border bg-surface-low text-on-surface
                     hover:bg-surface-high transition-colors
                     disabled:opacity-40 disabled:hover:bg-surface-low"
          >
            −
          </button>

          <span className="text-body-sm text-on-surface-variant font-body w-12 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-border bg-surface-low text-on-surface
                     hover:bg-surface-high transition-colors
                     disabled:opacity-40 disabled:hover:bg-surface-low"
          >
            +
          </button>

          <button
            onClick={resetZoom}
            className="px-2.5 py-1 rounded-md text-label-sm font-label text-primary
                     hover:bg-primary-container/10 transition-colors"
          >
            Reset
          </button>
        </div>

        {saving && (
          <span className="absolute right-2 text-label-sm text-on-surface-variant/70 font-label animate-pulse">
            Saving progress…
          </span>
        )}

        {syncError && (
          <span className="text-label-sm text-red-900 font-label animate-pulse">
            {syncError}
          </span>
        )}
      </div>

      {/* PDF Page */}
      <div
        ref={viewerRef}
        className="overflow-auto w-screen flex items-center justify-center rounded-lg bg-surface-container-lowest shadow-sm border border-border p-4"
      >
        <Document
          file={bookUrl}
          onLoadSuccess={onBookLoadSuccess}
          onLoadError={onBookLoadError}
          loading={
            <p className="text-body-md text-on-surface-variant font-body py-8">
              Loading PDF…
            </p>
          }
        >
          <div
            style={{
              transform: `scale(${visualScale / scale})`,
              transformOrigin: "center center",
            }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              className="shadow-md transition-transform duration-150"
            />
          </div>
        </Document>
      </div>
    </div>
  );
}
