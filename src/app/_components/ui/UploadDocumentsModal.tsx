import { useRef, useState } from "react";
import { X, UploadCloud, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useOnClickOutside } from "@/app/_lib/hooks/useOnClickOutisde";
import { useKeyPress } from "@/app/_lib/hooks/useKeyPress";

type FileStatus = "waiting" | "uploading" | "complete";

interface UploadFile {
  id: number;
  name: string;
  size: number;
  progress: number;
  status: FileStatus;
}

const MAX_SIZE_MB = 50;

const INITIAL_FILES: UploadFile[] = [
  {
    id: 1,
    name: "The_Republic_Plato.pdf",
    size: 2.4 * 1024 * 1024,
    progress: 100,
    status: "complete",
  },
  {
    id: 2,
    name: "Foundation_Asimov.epub",
    size: 1.8 * 1024 * 1024,
    progress: 64,
    status: "uploading",
  },
  {
    id: 3,
    name: "User_Experience_Methods.pdf",
    size: 12.1 * 1024 * 1024,
    progress: 0,
    status: "waiting",
  },
];

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface UploadDocumentsModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function UploadDocumentsModal({
  open = true,
  onClose = () => {},
}: UploadDocumentsModalProps) {
  const [files, setFiles] = useState<UploadFile[]>(INITIAL_FILES);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(modalRef, onClose, open);
  useKeyPress("Escape", onClose, open);

  const addFiles = (fileList: FileList) => {
    const incoming: UploadFile[] = Array.from(fileList).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: f.size,
      progress: 0,
      status: "waiting",
    }));
    setFiles((prev) => [...prev, ...incoming]);
  };

  const removeFile = (id: number) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-[520px] rounded-lg bg-surface-lowest"
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
              Support for PDF, EPUB, and MOBI up to {MAX_SIZE_MB}MB
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
              accept=".pdf,.epub,.mobi"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </label>

          {/* Selected files */}
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-label-sm text-on-surface-variant mb-2">
                Selected files ({files.length})
              </p>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-md border border-outline-variant px-3 py-2"
                  >
                    <FileText size={18} className="text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-on-surface">
                        {file.name}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        {formatSize(file.size)} ·{" "}
                        {file.status === "complete"
                          ? "Complete"
                          : file.status === "uploading"
                            ? `${file.progress}%`
                            : "Waiting"}
                      </p>
                      {file.status !== "waiting" && (
                        <div className="mt-1 h-1 w-full rounded-full bg-surface-high overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="shrink-0 text-on-surface-variant"
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
            onClick={onClose}
            className="rounded-md px-4 py-2 text-label-md font-medium text-on-surface-variant"
          >
            Cancel
          </button>
          <button
            disabled={files.length === 0}
            className="rounded-md bg-primary px-4 py-2 text-label-md font-medium text-primary-foreground disabled:opacity-40"
          >
            Upload to library
          </button>
        </div>
      </div>
    </div>
  );
}
