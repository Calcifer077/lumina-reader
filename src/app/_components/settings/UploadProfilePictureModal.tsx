"use client";

import React, { useRef, useState } from "react";

import { Camera, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useKeyPress } from "@/app/_lib/hooks/useKeyPress";
import { useOnClickOutside } from "@/app/_lib/hooks/useOnClickOutisde";
import { updateProfilePicture } from "@/app/_lib/userDetails";
import { Button } from "@/components/ui/button";

interface UploadProfilePictureModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function UploadProfilePictureModal({
  open = false,
  onClose = () => {},
}: UploadProfilePictureModalProps) {
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;

    const reader = new FileReader();

    setFile(file);
    reader.onload = (e: ProgressEvent<FileReader>) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  async function handleSave(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();

    if (!file) return;

    const res = await updateProfilePicture(file);

    if (res) {
      toast.success("Updated profile picture");
    } else {
      toast.error("Updating profile picture failed");
    }

    router.refresh();
    setFile(null);
  }

  useOnClickOutside(modalRef, onClose, open);
  useKeyPress("Escape", onClose, open);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200 motion-reduce:duration-100"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-130 rounded-lg bg-surface-lowest outline-none
          animate-in fade-in-0 zoom-in-95 duration-200 ease-out
          motion-reduce:zoom-in-100 motion-reduce:duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-on-surface font-semibold font-heading text-headline-md">
            Update Profile Photo
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface active:scale-90
              transition-[color,transform] duration-100 rounded-md p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-px bg-outline-variant" />

        {/* Body */}
        <div className="px-6 py-6 flex flex-col items-center gap-6">
          <button
            type="button"
            aria-label="Change photo"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full flex flex-col items-center justify-center gap-2
              border-2 border-dashed border-primary text-on-surface-variant
              hover:bg-surface-container active:scale-95
              transition-[background-color,transform] duration-150 ease-out overflow-hidden"
          >
            {preview ? (
              <img
                src={preview}
                alt="Selected profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Camera size={20} className="text-on-surface-variant" />
                <span className="text-[11px] leading-none">Preview</span>
              </>
            )}
          </button>

          <div
            className={`w-full rounded-lg border-2 border-dashed px-6 py-8 flex flex-col items-center gap-2
              text-center transition-[border-color,background-color,transform] duration-150 ease-out
              ${
                dragActive
                  ? "border-primary bg-surface-low scale-[1.01]"
                  : "border-outline-variant bg-transparent scale-100"
              }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
          >
            <UploadCloud size={20} className="text-primary" />
            <p className="text-sm font-medium text-on-surface">
              Drag and drop image
            </p>
            <p className="text-sm text-on-surface-variant">
              or{" "}
              <label
                className="text-primary hover:underline font-medium cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                browse file
              </label>
            </p>
            <p className="text-xs text-outline">JPG, PNG or WebP (Max 5MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="h-px bg-outline-variant" />

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface
              active:scale-95 px-3 py-2 rounded-md
              transition-[color,transform] duration-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!file}
            className="text-sm font-medium rounded-md px-4 py-2 bg-primary text-primary-foreground
              hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none
              transition-[opacity,transform] duration-100"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}
