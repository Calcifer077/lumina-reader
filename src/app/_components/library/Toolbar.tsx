"use client";

import { useRouter, useSearchParams } from "next/navigation";

import CustomSelect from "@/app/_components/ui/custom-select";

import { MdGridView } from "react-icons/md";
import { FaListUl } from "react-icons/fa";

const selectOptions = [
  { text: "recently added", value: "recently_added" },
  { text: "recently opened", value: "recently_opened" },
  { text: "Title A-Z", value: "title_a-z" },
  { text: "Title Z-A", value: "title_z-a" },
  { text: "PDFs", value: "pdf" },
  { text: "EPUB", value: "epub" },
];

export default function Toolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = searchParams.get("view") || "grid";
  const value = searchParams.get("sort") || "recently_added";

  function changeView(view: "grid" | "list") {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);

    router.push(`?${params.toString()}`);
  }

  function changeValue(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4">
      {/* Heading */}
      <div className="w-full text-left md:w-auto">
        <h1 className="text-headline-md font-heading font-bold text-on-surface">
          My Books
        </h1>
        <h3 className="text-body-sm text-on-surface-variant">
          Organized by recent activity
        </h3>
      </div>

      {/* Controls */}
      <div className="flex w-full items-center gap-3 md:w-auto md:justify-end">
        {/* Grid/List Toggle */}
        <div className="flex items-center rounded-lg border border-outline-variant bg-surface-container-low p-1 shadow-sm">
          <button
            className={`flex items-center rounded-md px-3 py-2 transition-colors ${
              view === "grid"
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
            onClick={() => changeView("grid")}
          >
            <MdGridView size={18} />
          </button>

          <button
            className={`flex items-center rounded-md px-3 py-2 transition-colors ${
              view === "list"
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
            onClick={() => changeView("list")}
          >
            <FaListUl size={18} />
          </button>
        </div>

        {/* Sort */}
        <div className="flex-1 md:flex-none">
          <CustomSelect
            value={value}
            onValueChange={changeValue}
            options={selectOptions}
          />
        </div>
      </div>
    </div>
  );
}
