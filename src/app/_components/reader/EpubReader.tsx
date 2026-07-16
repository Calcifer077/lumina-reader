import React, { useState, useRef, useEffect } from "react";
import { ReactReader, ReactReaderStyle } from "react-reader";
import type { Rendition } from "epubjs";
import { Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";

// 1. Create a custom styles object
const customReaderStyles = {
  ...ReactReaderStyle,
  // Overriding next/prev buttons
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

export default function App() {
  const [location, setLocation] = useState<string | number>(0);

  const [bgColor, setBgColor] = useState("FBF0D9");
  const [textColor, setTextColor] = useState("3D342D");
  const [fontSize, setFontSize] = useState("120");

  const [isVisible, setIsVisible] = useState(false);

  const renditionRef = useRef<Rendition | undefined>(undefined);

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
  const containerRef = useRef<HTMLDivElement>(null);
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
          </div>
        )}
      </div>
      <div ref={containerRef} className="relative h-full w-full">
        <ReactReader
          url="https://react-reader.metabits.no/files/alice.epub"
          location={location}
          locationChanged={(epubcfi: string) => setLocation(epubcfi)}
          readerStyles={customReaderStyles}
          epubOptions={{ spread: "none" }}
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
          }}
        />
      </div>
    </div>
  );
}
