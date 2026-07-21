"use client";

import { JSX, useRef, useState } from "react";

import { CheckCircle2, FileText, UploadCloud, X, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useKeyPress } from "@/app/_lib/hooks/useKeyPress";
import { useOnClickOutside } from "@/app/_lib/hooks/useOnClickOutisde";
import type { ApiResponse } from "@/app/_lib/types";
import type { Book } from "@/app/_lib/types";
import { formatSize, getExtension, stripExtension } from "@/app/_lib/utils";

type FileStatus = "waiting" | "uploading" | "complete" | "error";

interface UploadFile {
  id: number;
  file: File; // the actual blob — needed to upload
  name: string;
  size: number;
  title: string; // editable, defaults to filename
  status: FileStatus;
  error?: string;
}

const MAX_SIZE_MB: number = Number(process.env.MAX_SIZE_MB) || 50;
const ALLOWED_EXTENSIONS = ["pdf", "epub"];

interface UploadDocumentsModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function UploadDocumentsModal({
  open = true,
  onClose = () => {},
}: UploadDocumentsModalProps): JSX.Element | null {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(modalRef, onClose, open);
  useKeyPress("Escape", onClose, open);

  function addFiles(fileList: FileList): void {
    const incoming: UploadFile[] = [];
    let skipped = 0;

    Array.from(fileList).forEach((f, i) => {
      const ext = getExtension(f.name);
      const tooBig = f.size > MAX_SIZE_MB * 1024 * 1024;

      if (!ALLOWED_EXTENSIONS.includes(ext) || tooBig) {
        skipped += 1;
        return;
      }

      incoming.push({
        id: Date.now() + i,
        file: f,
        name: f.name,
        size: f.size,
        title: stripExtension(f.name),
        status: "waiting",
      });
    });

    if (skipped > 0) {
      // Only PDF/EPUB are supported by the reader; silently dropping
      // oversized/unsupported files here rather than queuing them to fail.
      console.warn(
        `${skipped} file(s) skipped: unsupported format or too large`,
      );
      toast.warning(
        `${skipped} file(s) skipped: unsupported format or too large`,
      );
    }

    setFiles((prev) => [...prev, ...incoming]);
  }

  function removeFile(id: number): void {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function updateTitle(id: number, title: string): void {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, title } : f)));
  }

  async function uploadOne(uploadFile: UploadFile): Promise<boolean> {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "uploading" } : f,
      ),
    );

    const formData = new FormData();
    formData.append("file", uploadFile.file);
    formData.append("title", uploadFile.title);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result: ApiResponse<Book> = await res.json();

      if (!result.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error", error: result.error }
              : f,
          ),
        );
        return false;
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "complete" } : f,
        ),
      );
      return true;
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "error",
                error: "Upload failed. Please try again.",
              }
            : f,
        ),
      );
      return false;
    }
  }

  async function handleSubmit(): Promise<void> {
    setIsSubmitting(true);

    const pending = files.filter(
      (f) => f.status === "waiting" || f.status === "error",
    );
    // Upload sequentially so we don't hammer the API with 10 concurrent multipart requests.
    for (const f of pending) {
      await uploadOne(f);
    }

    setIsSubmitting(false);
    router.refresh();
  }

  if (!open) return null;

  const hasUploadable = files.some(
    (f) => f.status === "waiting" || f.status === "error",
  );

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-lg">
      <div
        ref={modalRef}
        className="w-full max-w-130 rounded-lg bg-surface-lowest"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <UploadCloud size={18} className="text-primary" />
            <h2 className="font-heading text-headline-md text-on-surface">
              Upload documents
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dropzone */}
        <div className="px-6 py-5">
          <label
            htmlFor="file-upload-input"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center gap-2 rounded-md border-2 border-dashed px-6 py-8 text-center cursor-pointer ${
              isDragging
                ? "border-primary bg-secondary-container/40"
                : "border-outline-variant"
            }`}
          >
            <UploadCloud size={24} className="text-primary" />
            <p className="text-body-md font-medium text-on-surface">
              Drag and drop files here
            </p>
            <p className="text-body-sm text-on-surface-variant">
              Support for PDF and EPUB up to {MAX_SIZE_MB}MB
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 rounded-md bg-primary px-4 py-2 text-label-md font-medium text-primary-foreground"
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              id="file-upload-input"
              type="file"
              multiple
              accept=".pdf,.epub"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = ""; // allow re-selecting the same file later
              }}
            />
          </label>

          {/* Selected files */}
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-label-sm text-on-surface-variant mb-2">
                Selected files ({files.length})
              </p>
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-md border border-outline-variant px-3 py-2"
                  >
                    <FileText
                      size={18}
                      className="text-primary shrink-0 mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={file.title}
                        onChange={(e) => updateTitle(file.id, e.target.value)}
                        disabled={
                          file.status === "uploading" ||
                          file.status === "complete"
                        }
                        className="w-full truncate bg-transparent text-body-sm font-medium text-on-surface outline-none disabled:opacity-70"
                      />
                      <p className="text-label-sm text-on-surface-variant">
                        {formatSize(file.size)} ·{" "}
                        {file.status === "complete"
                          ? "Complete"
                          : file.status === "uploading"
                            ? "Uploading…"
                            : file.status === "error"
                              ? (file.error ?? "Failed")
                              : "Waiting"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === "uploading"}
                      className="shrink-0 text-on-surface-variant disabled:opacity-40"
                    >
                      {file.status === "complete" ? (
                        <CheckCircle2 size={18} className="text-tertiary" />
                      ) : (
                        <XCircle size={18} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-outline-variant px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-label-md font-medium text-on-surface-variant"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!hasUploadable || isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-label-md font-medium text-primary-foreground disabled:opacity-40"
            onClick={handleSubmit}
          >
            {isSubmitting ? "Uploading…" : "Upload to library"}
          </button>
        </div>
      </div>
    </div>
  );
}
