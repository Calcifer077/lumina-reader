"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "@/app/_lib/hooks/useTheme";

import { IoMdCloudUpload } from "react-icons/io";
import { CiSearch } from "react-icons/ci";

import { Sun, Moon } from "lucide-react";

import { Input } from "@/components/ui/input";
import UploadDocumentsModal from "@/app/_components/ui/UploadDocumentsModal";

import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { darkMode, toggle } = useTheme();

  return (
    <>
      <nav className="fixed top-0 flex justify-between items-center w-full h-18 px-4 bg-background border-b border-border z-50">
        <div className="font-extrabold uppercase text-primary tracking-normal text-lg md:text-xl">
          Lumina Reader
        </div>

        <div className="flex space-x-4 items-center">
          <div className="hidden relative lg:flex">
            <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search your library..."
              className="pl-10 h-10"
            />
          </div>

          <div
            className="flex items-center gap-2 cursor-pointer border p-2 px-6 rounded-lg bg-primary text-primary-foreground"
            onClick={() => setIsUploadOpen(true)}
          >
            <IoMdCloudUpload />
            <div className="hidden lg:flex">Upload Book</div>
          </div>

          <Button
            onClick={toggle}
            variant="ghost"
            size="icon"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            className="rounded-full w-9 h-9 border border-border bg-surface-container-high/80 backdrop-blur-md shadow-sm hover:bg-surface-high hover:shadow-md transition-all duration-1200"
          >
            <div className="relative h-4 w-4">
              <Sun
                className={`absolute inset-0 h-4 w-4 text-on-surface-variant transition-all duration-300 ${
                  darkMode
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <Moon
                className={`absolute inset-0 h-4 w-4 text-on-surface-variant transition-all duration-300 ${
                  darkMode
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              />
            </div>
          </Button>

          <div className="w-10 h-10 rounded-full overflow-hidden border border-primary">
            <Image src="/115633814.jpg" alt="Profile" width={40} height={40} />
          </div>
        </div>
      </nav>

      <UploadDocumentsModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
}
