"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import CustomSelect from "@/app/_components/ui/custom-select";

import { MdGridView } from "react-icons/md";
import { FaListUl } from "react-icons/fa";

const selectOptions = [
  { text: "recently added", value: "recently_added" },
  { text: "recently opened", value: "recently_opened" },
  { text: "Title A-Z", value: "title_a-z" },
  { text: "Title Z-A", value: "title_z-a" },
];

export default function Toolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [value, setValue] = useState("recently_added");
  const [view, setView] = useState(searchParams.get("view") || "grid");

  function changeView(view: "grid" | "list") {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);

    setView(view);

    router.push(`?${params.toString()}`);
  }

  function changeValue(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);

    setValue(value);

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-headline-md font-heading font-bold text-on-surface">
          My Books
        </h1>
        <h3 className="text-body-sm text-on-surface-variant">
          Organized by recent activity
        </h3>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-1 border border-outline-variant">
          <button
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-body-sm font-medium transition-colors ${
              view === "grid"
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
            onClick={() => changeView("grid")}
          >
            <MdGridView size={18} />
            <span>Grid</span>
          </button>

          <button
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-body-sm font-medium transition-colors ${
              view === "list"
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
            onClick={() => changeView("list")}
          >
            <FaListUl size={18} />
            <span>List</span>
          </button>
        </div>

        <CustomSelect
          value={value}
          onValueChange={changeValue}
          options={selectOptions}
        />
      </div>
    </div>
  );
}
