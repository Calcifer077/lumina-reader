"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReactReader, ReactReaderStyle } from "react-reader";

import type { Rendition } from "epubjs";
import { Menu, X } from "lucide-react";

import useLocalStorage from "@/app/_lib/hooks/useLocalStorage";
import { Input } from "@/components/ui/input";

interface EpubViewerProps {
  bookId: string;
  url: string;
  /** Initial location (epubcfi string) to open the book at, or null to start at the beginning */
  location: string | null;
}

// Custom styles for the ReactReader chrome (arrows, container inset, etc.)
const customReaderStyles = {
  ...ReactReaderStyle,
  arrow: {
    ...ReactReaderStyle.arrow,
    color: "#8b4513",
  },
  reader: {
    ...ReactReaderStyle.reader,
    top: 8,
    left: 8,
    bottom: 8,
    right: 8,
  },
};

const SAVE_DEBOUNCE_MS = 2000;

export default function EpubViewer({
  bookId,
  url,
  location: initialLocation,
}: EpubViewerProps) {
  // --- Rendering / location state (from ReactReader-based viewer) ---
  const [location, setLocation] = useState<string | number>(
    initialLocation ?? 0,
  );
  const [bgColor, setBgColor] = useLocalStorage("epub-bg-color", "FBF0D9");
  const [textColor, setTextColor] = useLocalStorage(
    "epub-text-color",
    "3D342D",
  );
  const [fontSize, setFontSize] = useLocalStorage("epub-font-size", "120");
  const [isVisible, setIsVisible] = useState(false);

  const renditionRef = useRef<Rendition | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Progress-sync state (from custom epubjs viewer) ---
  const [saving, setSaving] = useState<boolean>(false);
  const [syncError, setSyncError] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedLocationRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  const saveProgress = useCallback(
    async (locationStr: string) => {
      if (locationStr === lastSavedLocationRef.current) {
        return;
      }

      setSaving(true);
      setSyncError("");

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
        if (isMountedRef.current) {
          setSaving(false);
        }
      }
    },
    [bookId],
  );

  // Debounce saves so we don't hit the API on every single page turn.
  const scheduleSaveProgress = useCallback(
    (locationStr: string) => {
      if (locationStr === lastSavedLocationRef.current) {
        return;
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        saveProgress(locationStr);
      }, SAVE_DEBOUNCE_MS);
    },
    [saveProgress],
  );

  const handleLocationChanged = useCallback(
    (epubcfi: string) => {
      setLocation(epubcfi);
      scheduleSaveProgress(epubcfi);
    },
    [scheduleSaveProgress],
  );

  // --- Appearance controls ---
  function handleBgColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBgColor(e.target.value);
  }

  function handleTextColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTextColor(e.target.value);
  }

  function handleFontSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFontSize(e.target.value);
  }

  useEffect(() => {
    if (!renditionRef.current) return;

    const rendition = renditionRef.current;

    rendition.themes.override("background-color", `#${bgColor}`);
    rendition.themes.override("color", `#${textColor}`);
    rendition.themes.fontSize(`${Number(fontSize)}%`);
  }, [bgColor, textColor, fontSize]);

  return (
    <div className="h-dvh">
      <div className="relative">
        {!isVisible && (
          <div className="absolute top-2 left-2 z-1000">
            <Menu onClick={() => setIsVisible(true)} />
          </div>
        )}
        {isVisible && (
          <div className="absolute top-2 left-2 z-1000 flex w-80 flex-col gap-3 rounded-xl border border-slate-300 bg-slate-100 p-4 shadow-lg">
            <div className="absolute top-2 right-4">
              <X onClick={() => setIsVisible(false)} />
            </div>
            <Input
              placeholder="Background color (#FBF0D9)"
              className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-slate-400 mt-6"
              value={bgColor}
              onChange={handleBgColorChange}
            />

            <Input
              placeholder="Text color (#1E293B)"
              className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-slate-400"
              value={textColor}
              onChange={handleTextColorChange}
            />

            <Input
              placeholder="Font size (16px)"
              className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-slate-400"
              type="number"
              value={fontSize}
              onChange={handleFontSizeChange}
            />

            {/* Sync status indicators */}
            <div className="mt-1 text-xs text-slate-500">
              {saving && <span>Syncing...</span>}
              {syncError && <span className="text-red-600">{syncError}</span>}
            </div>
          </div>
        )}
      </div>
      <div ref={containerRef} className="relative h-full w-full">
        <ReactReader
          url={url}
          location={location}
          locationChanged={handleLocationChanged}
          readerStyles={customReaderStyles}
          epubOptions={{ spread: "none" }}
          epubInitOptions={{ openAs: "epub" }}
          getRendition={(rendition) => {
            renditionRef.current = rendition;

            rendition.themes.override("background-color", `#${bgColor}`);
            rendition.themes.override("color", `#${textColor}`);
            rendition.themes.fontSize(`${Number(fontSize)}%`);

            rendition.on("click", (event: MouseEvent) => {
              // Get the current visible contents of the rendition.
              // getContents() can return either a single object or an array depending on view mode,
              // so normalize it to a single "content" object.
              const contents = rendition.getContents();
              const content = Array.isArray(contents) ? contents[0] : contents;

              // The epub content lives inside an iframe, so grab that iframe's window.
              const iframeWindow = content?.window;

              // Check if the user has selected any text inside the iframe.
              const selection = iframeWindow?.getSelection?.();

              // If there's an active text selection, bail out — this click was likely
              // the end of a text-selection drag (e.g. for highlighting/copying),
              // not an intent to turn the page.
              if (selection && selection.toString().length > 0) {
                return;
              }

              // Get the actual iframe DOM element so we can figure out where it sits
              // on the outer page (its offset relative to the container).
              const iframeEl: HTMLIFrameElement | undefined =
                iframeWindow?.frameElement as HTMLIFrameElement | undefined;

              // Safety check: if we don't have the iframe or the outer container ref, do nothing.
              if (!iframeEl || !containerRef.current) return;

              // Get bounding boxes for both the iframe and the outer reader container,
              // so we can convert the click's iframe-relative coordinates into
              // container-relative coordinates.
              const iframeRect = iframeEl.getBoundingClientRect();
              const containerRect =
                containerRef.current.getBoundingClientRect();

              // event.clientX is relative to the iframe's own viewport, so add the
              // iframe's offset from the container to get the click's true X position
              // within the whole reader container.
              const absoluteX =
                iframeRect.left + event.clientX - containerRect.left;

              // Total width of the reader container — used to determine "left half" vs "right half".
              const totalWidth = containerRect.width;

              // Tap-to-navigate: left half of the screen goes to the previous page,
              // right half goes to the next page (like most ebook reader UIs).
              if (absoluteX < totalWidth / 2) {
                rendition.prev();
              } else {
                rendition.next();
              }
            });

            // If an initial location/progress was passed in, jump there once mounted.
            if (initialLocation) {
              rendition.display(initialLocation);
            }
          }}
        />
      </div>
    </div>
  );
}
