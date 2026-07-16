"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { CloudAlert, CloudCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";

import { useKeyPress } from "@/app/_lib/hooks/useKeyPress";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function highlightPattern(text: string, pattern: string) {
  return text.replace(pattern, (value) => `<mark>${value}</mark>`);
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    zIndex: 1,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

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
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>("");
  const [pageWidth, setPageWidth] = useState<number>(800);
  const [direction, setDirection] = useState(0);
  const [useIFrame, setUseIFrame] = useState(false);
  const [IFrameUsageConfirmation, setIFrameUsageConfirmation] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedPage = useRef(initialPage);

  useEffect(() => {
    const updateWidth = () => {
      const width = Math.min(window.innerWidth - 32, 900);
      setPageWidth(width);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (!IFrameUsageConfirmation) return;

    const timeout = setTimeout(() => setIFrameUsageConfirmation(false), 3000);
    return () => clearTimeout(timeout);
  }, [IFrameUsageConfirmation]);

  function handleIFrameButtonClick() {
    if (!IFrameUsageConfirmation) {
      setIFrameUsageConfirmation(true);

      toast.warning("This will remove feature of syncing.", {
        position: "bottom-left",
      });
      return;
    }

    setUseIFrame((prev) => !prev);
    setIFrameUsageConfirmation(false);
  }

  function onBookLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  function onBookLoadError(err: Error): void {
    console.error("Failed to load PDF. ", err);
    setError("Failed to load PDF. Please try again.");
  }

  // If the user clicks more than one time in 1 sec, previous clicks will be cancelled (debounce)
  useEffect(() => {
    if (lastSavedPage.current === pageNumber) return;

    const timeout = setTimeout(async () => {
      try {
        setIsSaving(true);
        setError("");

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
          setError("There was a problem while syncing.");
          return;
        }

        lastSavedPage.current = pageNumber;
      } catch (err) {
        console.error(err);
        setError("There was a problem while syncing.");
      } finally {
        setIsSaving(false);
      }
    }, 1000); // Wait 1 second after the last page change

    return () => clearTimeout(timeout);
  }, [pageNumber, bookId]);

  function goToPrevPage(): void {
    if (pageNumber > 1) {
      setDirection(-1);
      setPageNumber((p) => p - 1);
    }
  }

  function goToNextPage(): void {
    if (!numPages || pageNumber < numPages) {
      setDirection(1);
      setPageNumber((p) => p + 1);
    }
  }

  function zoomPos(): void {
    setZoomLevel((z) => Math.min(Number((z + 0.1).toFixed(2)), 3));
  }

  function zoomNeg(): void {
    setZoomLevel((z) => Math.max(Number((z - 0.1).toFixed(2)), 0.2));
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchText(event.target.value);
  }

  const textRenderer = useCallback(
    (textItem: { str: string }) => highlightPattern(textItem.str, searchText),
    [searchText],
  );

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    // If the user is zoomed in (zoomLevel > 1), disable click-to-page navigation
    if (zoomLevel > 1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width / 2) {
      if (pageNumber > 1) goToPrevPage();
    } else {
      if (!numPages || pageNumber < numPages) goToNextPage();
    }
  }

  useKeyPress("ArrowLeft", goToPrevPage, true);
  useKeyPress("ArrowRight", goToNextPage, true);

  if (!useIFrame) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-background relative">
        {/* 1. Added relative and overflow-hidden here to contain sliding pages */}
        {/* Replace the middle section inside PdfViewer */}
        <div className="flex-1 overflow-hidden relative bg-muted p-4 flex items-center justify-center w-full">
          <Document
            file={bookUrl}
            onLoadSuccess={onBookLoadSuccess}
            onLoadError={onBookLoadError}
            loading={
              <p className="text-body-md text-on-surface-variant font-body py-8 m-auto">
                Loading PDF…
              </p>
            }
            className="relative flex items-center justify-center w-full h-full overflow-hidden"
          >
            <div
              className="absolute inset-0 z-0 pointer-events-auto cursor-pointer overflow-hidden flex items-center justify-center"
              onClick={handleOverlayClick}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={pageNumber}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ opacity: { duration: 0.1 } }}
                  className="absolute max-w-full max-h-full overflow-auto shadow-xl"
                >
                  <Page
                    pageNumber={pageNumber}
                    customTextRenderer={textRenderer}
                    width={pageWidth}
                    scale={zoomLevel}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </Document>
        </div>
        {/* 3. Added relative and solid bg-background to ensure the control panel always sits over the rendering area */}
        <div className="relative z-10 flex items-center justify-center gap-4 border-t bg-background p-4 shadow-sm">
          <div className="hidden lg:flex items-center gap-2">
            <label htmlFor="search" className="text-sm font-medium">
              Search:
            </label>
            <input
              type="search"
              id="search"
              value={searchText}
              onChange={onChange}
              className="border rounded px-2 py-1 text-sm bg-input"
            />
          </div>

          <Button onClick={goToPrevPage} disabled={pageNumber === 1}>
            Previous
          </Button>

          <span className="text-sm font-medium tabular-nums">
            {pageNumber} {numPages && `/ ${numPages}`}
          </span>

          <Button
            onClick={goToNextPage}
            disabled={numPages ? pageNumber === numPages : false}
          >
            Next
          </Button>

          <Button onClick={zoomNeg}>-</Button>
          <span className="text-sm font-medium min-w-14 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button onClick={zoomPos}>+</Button>
        </div>

        <div className="absolute top-4 left-4">
          <Button onClick={handleIFrameButtonClick}>
            {IFrameUsageConfirmation ? "Click again to confirm" : "Use Iframe?"}
          </Button>
        </div>

        <div className="absolute top-4 right-4">
          {/* <div>{isSaving && <CloudSync />}</div> */}
          <div>
            {error && (
              <Tooltip>
                <TooltipTrigger>
                  <CloudAlert
                    onClick={() => {
                      // Only run if the screen width is mobile
                      if (window.innerWidth <= 768) {
                        toast.error(error);
                      }
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>{error}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div>
            {!isSaving && (
              <Tooltip>
                <TooltipTrigger>
                  <CloudCheck />
                </TooltipTrigger>
                <TooltipContent>Everything is in sync</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div>
            {isSaving && (
              <Tooltip>
                <TooltipTrigger>
                  <RefreshCw className="animate-spin" />
                </TooltipTrigger>
                <TooltipContent>Syncing with your library</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex h-screen flex-col bg-background relative">
        <iframe src={bookUrl} className="h-full w-full"></iframe>
      </div>
    );
  }
}
