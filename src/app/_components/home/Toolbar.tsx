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
        <h1 className="text-2xl font-bold">My Books</h1>
        <h3 className="text-gray-500">Organized by recent activity</h3>
      </div>

      <div className="flex items-center gap-4">
        <button
          className={`${view === "grid" ? "text-black" : "hover:text-black text-gray-600 transition-colors"}`}
          onClick={() => changeView("grid")}
        >
          <MdGridView size={24} />
        </button>
        <button
          className={`${view === "list" ? "text-black" : "text-gray-600 hover:text-black transition-colors"}`}
          onClick={() => changeView("list")}
        >
          <FaListUl size={24} />
        </button>

        <CustomSelect
          value={value}
          onValueChange={changeValue}
          options={selectOptions}
        />
      </div>
    </div>
  );
}
