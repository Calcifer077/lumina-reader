"use client";

import { useState } from "react";
import { MdGridView } from "react-icons/md";
import { FaListUl } from "react-icons/fa";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const selectOptions = [
  { text: "recently added", value: "recently_added" },
  { text: "recently opened", value: "recently_opened" },
  { text: "Title A-Z", value: "title_a-z" },
  { text: "Title Z-A", value: "title_z-a" },
];

export default function Home() {
  const [value, setValue] = useState("recently_added");

  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Books</h1>
          <h3 className="text-gray-500">Organized by recent activity</h3>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-black transition-colors">
            <MdGridView size={24} />
          </button>
          <button className="text-gray-600 hover:text-black transition-colors">
            <FaListUl size={24} />
          </button>

          <div>
            <Select value={value} onValueChange={setValue}>
              {/* Trigger Styles: No border, uppercase, centered text, custom color */}
              <SelectTrigger className="w-48 border-none bg-transparent uppercase font-semibold text-primary focus:ring-0 focus:ring-offset-0 justify-center gap-2">
                <SelectValue />
              </SelectTrigger>

              {/* Dropdown Menu Styles */}
              <SelectContent className="bg-background border border-gray-100 shadow-md">
                {selectOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="uppercase bg-background focus:bg-indigo-50 text-primary justify-center cursor-pointer font-medium"
                  >
                    {option.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
