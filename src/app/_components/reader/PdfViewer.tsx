"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { useKeyPress } from "@/app/_lib/hooks/useKeyPress";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MIN_SCALE_FACTOR = 0.5; // relative to "fit" scale
const MAX_SCALE_FACTOR = 4; // relative to "fit" scale
const SCALE_STEP = 0.25;
const CONTAINER_PADDING = 32; // keep in sync with the p-4 (16px * 2 sides) on the viewer

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

  const [fitScale, setFitScale] = useState<number | null>(null); // scale that fits the whole page in view
  const [scale, setScale] = useState<number | null>(null); // actual current render scale

  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [error, setError] = useState<string | null>(null);
  const lastSavedPage = useRef(initialPage);

  const viewerRef = useRef<HTMLDivElement>(null);
  const pageNaturalSize = useRef<{ width: number; height: number } | null>(
    null,
  );
  const hasInitializedScale = useRef(false);

  function onBookLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onBookLoadError(err: Error): void {
    console.error("Failed to load PDF. ", err);
    setError("Failed to load PDF. Please try again.");
  }

  // Compute the scale that fits the entire page inside the viewer
  const computeFitScale = useCallback(() => {
    const container = viewerRef.current;
    const natural = pageNaturalSize.current;
    if (!container || !natural) return;

    const availableWidth = container.clientWidth - CONTAINER_PADDING;
    const availableHeight = container.clientHeight - CONTAINER_PADDING;

    const widthScale = availableWidth / natural.width;
    const heightScale = availableHeight / natural.height;
    const newFitScale = Math.min(widthScale, heightScale);

    setFitScale(newFitScale);

    // Only auto-set the render scale to "fit" the first time (initial load),
    // so we don't stomp on a user's manual zoom when they resize/rotate mid-read.
    if (!hasInitializedScale.current) {
      setScale(newFitScale);
      hasInitializedScale.current = true;
    }
  }, []);

  // react-pdf's Page onLoadSuccess gives us the page's unscaled (original) size
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onPageLoadSuccess(page: any) {
    pageNaturalSize.current = {
      width: page.originalWidth,
      height: page.originalHeight,
    };
    computeFitScale();
  }

  // Recompute fit scale on container resize (rotation, split-screen, etc.)
  useEffect(() => {
    const container = viewerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => computeFitScale());
    observer.observe(container);
    return () => observer.disconnect();
  }, [computeFitScale]);

  // If the user clicks more than one time in 1 sec, previous clicks will be cancelled (debounce)
  useEffect(() => {
    if (lastSavedPage.current === pageNumber) return;

    const timeout = setTimeout(async () => {
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
    }, 1000); // Wait 1 second after the last page change

    return () => clearTimeout(timeout);
  }, [pageNumber, bookId]);

  const goToPrevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNextPage = () =>
    setPageNumber((p) => Math.min(numPages || p, p + 1));

  const minScale = fitScale ? fitScale * MIN_SCALE_FACTOR : 0.25;
  const maxScale = fitScale ? fitScale * MAX_SCALE_FACTOR : 3;

  const zoomIn = () =>
    setScale((s) =>
      Math.min(maxScale, +((s ?? minScale) + SCALE_STEP).toFixed(2)),
    );
  const zoomOut = () =>
    setScale((s) =>
      Math.max(minScale, +((s ?? maxScale) - SCALE_STEP).toFixed(2)),
    );
  const resetZoom = () => fitScale && setScale(fitScale);

  const isZoomedIn = !!fitScale && !!scale && scale > fitScale + 0.01;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // When zoomed in, taps are used for panning (native scroll), not page nav
    if (isZoomedIn) return;

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

  return (
    <div className="relative flex flex-col items-center gap-4 h-dvh w-full">
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
            disabled={!scale || scale <= minScale}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-border bg-surface-low text-on-surface
                     hover:bg-surface-high transition-colors
                     disabled:opacity-40 disabled:hover:bg-surface-low"
          >
            −
          </button>

          <span className="text-body-sm text-on-surface-variant font-body w-12 text-center tabular-nums">
            {fitScale && scale ? Math.round((scale / fitScale) * 100) : 100}%
          </span>

          <button
            onClick={zoomIn}
            disabled={!scale || scale >= maxScale}
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
            Fit
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
        className="overflow-auto h-dvh w-full flex rounded-lg bg-surface-container-lowest shadow-sm border border-border p-4"
      >
        <Document
          file={bookUrl}
          onLoadSuccess={onBookLoadSuccess}
          onLoadError={onBookLoadError}
          loading={
            <p className="text-body-md text-on-surface-variant font-body py-8 m-auto">
              Loading PDF…
            </p>
          }
          className="m-auto"
        >
          <div className="relative">
            <Page
              pageNumber={pageNumber}
              scale={scale ?? 1}
              onLoadSuccess={onPageLoadSuccess}
              className="shadow-md"
            />
            <div
              onClick={handleOverlayClick}
              className="absolute inset-0"
              style={{
                zIndex: 10,
                // Block browser gestures only when NOT zoomed (so tap-nav works cleanly).
                // Once zoomed in, hand touch control back to the browser so drag-to-pan
                // via the scrollable container works.
                touchAction: isZoomedIn ? "pan-x pan-y" : "none",
              }}
            ></div>
          </div>
        </Document>
      </div>
    </div>
  );
}
