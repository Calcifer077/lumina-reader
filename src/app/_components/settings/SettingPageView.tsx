"use client";

import { useState } from "react";

import { BookOpen, Minus, Pencil, Plus, TriangleAlert } from "lucide-react";
import Image from "next/image";

import UploadProfilePictureModal from "@/app/_components/settings/UploadProfilePictureModal";
import useLocalStorage from "@/app/_lib/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface SettingPageViewProps {
  userName: string;
  email: string;
  profilePicturePath: string;
}

export default function SettingsPageView({
  userName,
  email,
  profilePicturePath,
}: SettingPageViewProps) {
  const [backgroundColor, setBackgroundColor] = useLocalStorage(
    "epub-bg-color",
    "#f7f9f9",
  );
  const [textColor, setTextColor] = useLocalStorage(
    "epub-text-color",
    "#222222",
  );
  const [fontSize, setFontSize] = useLocalStorage("epub-font-size", 120);
  const [zoom, setZoom] = useLocalStorage("pdf-zoom-level", 1);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleDeleteClick = () => {
    if (confirmingDelete) {
      // actual delete logic goes here
      setConfirmingDelete(false);
    } else {
      setConfirmingDelete(true);
    }
  };

  return (
    <>
      <div className="bg-background text-on-surface h-full px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="mb-8 text-on-surface-variant">
          Manage your reading experience and account preferences.
        </p>

        <div className="mb-8 bg-surface-container border border-outline-variant rounded-md p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {/* Profile Image */}
            <div className="flex justify-center md:justify-start relative">
              <Image
                alt="Profile"
                src={profilePicturePath}
                width={88}
                height={88}
                className="w-22 h-22 rounded-full border-2 border-outline-variant object-cover"
              />
              <Button
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center bg-primary text-on-primary-container"
                onClick={() => setIsUploadOpen(true)}
              >
                <Pencil size={14} />
              </Button>
            </div>

            {/* Form */}
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl justify-center items-center my-auto">
              <Input
                placeholder="Name"
                value={userName}
                className="max-w-sm bg-surface text-on-surface-variant transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Input
                placeholder="Email"
                value={email}
                className="max-w-sm bg-surface text-on-surface-variant transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div>
            <BookOpen size={30} className="text-primary" />
          </div>
          <div className="text-lg font-semibold">Reading preference</div>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-xl p-6 sm:p-8 shadow-sm space-y-8 mb-8">
          {/* Zoom Level */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Zoom Level</h3>

              <span className="rounded-full bg-secondary-container px-3 py-1 text-sm font-medium text-on-secondary-container tabular-nums">
                {(zoom * 100).toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 transition-transform duration-100 active:scale-90"
                onClick={() => setZoom((z) => Math.max(0, z - 5))}
              >
                <Minus size={18} />
              </Button>

              <Slider
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                max={3}
                min={0.2}
                step={0.1}
                className="flex-1 [&_[role=slider]]:transition-transform [&_[role=slider]]:duration-150 [&_[role=slider]]:active:scale-110"
              />

              <Button
                variant="outline"
                size="icon"
                className="shrink-0 transition-transform duration-100 active:scale-90"
                onClick={() => setZoom((z) => Math.min(100, z + 5))}
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>

          {/* Full-width Divider */}
          <div className="border-t border-outline-variant" />

          {/* EPUB Colors */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">EPUB Appearance</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* Background */}
              <div className="lg:col-span-5">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Background Color
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface text-on-surface-variant px-3 py-2 transition-colors duration-150 focus-within:ring-2 focus-within:ring-primary">
                  <div
                    className="h-6 w-8 shrink-0 rounded border border-outline-variant"
                    style={{ backgroundColor }}
                  />

                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0"
                  />

                  <Pencil
                    size={18}
                    className="shrink-0 text-on-surface-variant"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="lg:col-span-5">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Text Color
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface text-on-surface-variant px-3 py-2 transition-colors duration-150 focus-within:ring-2 focus-within:ring-primary">
                  <div
                    className="h-6 w-8 shrink-0 rounded border border-outline-variant"
                    style={{ backgroundColor: textColor }}
                  />

                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0"
                  />

                  <Pencil
                    size={18}
                    className="shrink-0 text-on-surface-variant"
                  />
                </div>
              </div>

              {/* Font Size */}
              <div className="lg:col-span-2">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  Font Size
                </label>

                <div className="flex items-center gap-1 rounded-lg border border-outline-variant bg-surface text-on-surface-variant px-2 py-2 transition-colors duration-150 focus-within:ring-2 focus-within:ring-primary">
                  <button
                    type="button"
                    onClick={() => setFontSize((f) => Math.max(50, f - 10))}
                    className="shrink-0 rounded p-1 text-on-surface-variant transition-transform duration-100 hover:bg-surface-container-high active:scale-90"
                    aria-label="Decrease font size"
                  >
                    <Minus size={14} />
                  </button>

                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="border-0 shadow-none text-center px-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <button
                    type="button"
                    onClick={() => setFontSize((f) => Math.min(300, f + 10))}
                    className="shrink-0 rounded p-1 text-on-surface-variant transition-transform duration-100 hover:bg-surface-container-high active:scale-90"
                    aria-label="Increase font size"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div>
            <TriangleAlert size={30} className="text-error" />
          </div>
          <div className="text-lg font-semibold text-error">
            Library management
          </div>
        </div>

        <div className="mb-8 rounded-xl border border-outline-variant bg-surface-container p-6 sm:p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Delete Books */}
            <div className="flex flex-col rounded-xl border border-outline-variant bg-surface p-6 transition-colors duration-150 hover:border-error/40">
              <h3 className="text-lg font-semibold">Delete All Books</h3>

              <p className="mt-2 mb-4 text-md leading-6 text-on-surface-variant">
                Permanently delete every book in your library, including all
                files, covers, and metadata. This action cannot be undone.
              </p>

              <Button
                variant="destructive"
                className="mt-auto w-full py-6 font-bold transition-transform duration-100 active:scale-[0.98] cursor-pointer"
                onClick={handleDeleteClick}
                onBlur={() => setConfirmingDelete(false)}
              >
                {confirmingDelete
                  ? "Click again to confirm"
                  : "Delete All Books"}
              </Button>
            </div>

            {/* Clear History */}
            <div className="flex flex-col rounded-xl border border-outline-variant bg-surface p-6">
              <h3 className="text-lg font-semibold">Clear Reading History</h3>

              <p className="mt-2 mb-4 text-md leading-6 text-on-surface-variant">
                Reset reading progress for every book and remove your recently
                opened list.
              </p>

              <Button
                variant="outline"
                className="mt-auto w-full py-6 font-bold transition-transform duration-100 active:scale-[0.98] cursor-pointer"
              >
                Clear History
              </Button>
            </div>
          </div>
        </div>
      </div>

      <UploadProfilePictureModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
}
