"use client";

import { useState, useRef, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";

export interface CustomSelectOption {
  text: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: CustomSelectOption[];
  className?: string;
}

export default function CustomSelect({
  value,
  onValueChange,
  options,
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  function handleSelect(optionValue: string) {
    onValueChange(optionValue);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-48 flex items-center justify-center gap-2 uppercase font-normal text-primary cursor-pointer bg-transparent"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected?.text}</span>
        <IoChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-48 bg-background border border-gray-100 shadow-md rounded-md z-50 overflow-hidden"
        >
          {options.map((option) => (
            <div
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleSelect(option.value)}
              className={`px-4 py-2 text-center uppercase font-normal cursor-pointer text-primary hover:bg-indigo-50 ${
                option.value === value ? "bg-indigo-50" : ""
              }`}
            >
              {option.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
