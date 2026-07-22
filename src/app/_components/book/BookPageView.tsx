"use client";

import { useRef, useState } from "react";

import { MoveLeft, Pencil, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import DangerAlertDialog from "@/app/_components/book/DangerAlertDialog";
import { deleteBook, updateBook, updateBookImage } from "@/app/_lib/books";
import { resetHistoryForABook } from "@/app/_lib/progress";
import type { BookFromApi } from "@/app/_lib/types";
import { Button } from "@/components/ui/button";

export default function BookPageView({ book }: { book: BookFromApi }) {
  const [title, setTitle] = useState<string>(book.title);
  const [author, setAuthor] = useState<string>(book.author);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setFile(file);
  }

  async function handleBookImageChange() {
    fileInputRef.current?.click();
  }

  async function handleUploadImage(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();

    if (!file) return;

    const res = await updateBookImage(book.id, file);

    if (res) {
      toast.success("Updated book image");
      router.refresh();
    } else toast.error("Updating book image failed");

    setFile(null);
  }

  async function handleUpdate() {
    if (title.trim().length === 0 || author.trim().length === 0) {
      toast.warning("Title and author can't be empty.");
      return;
    }

    const res = await updateBook(book.id, title, author);

    setIsMutating(true);

    if (res) toast.success("Book updated successfully.");
    else toast.error("Something went wrong while updating the book!");

    setIsMutating(false);
  }

  async function handleResetHistory() {
    setIsMutating(true);

    const res = await resetHistoryForABook(book.id);

    if (res) toast.success("Book reading history was reset.");
    else toast.error("Something went wrong while reseting history");

    setIsMutating(false);
  }

  async function handleDelete() {
    const res = await deleteBook(book.id);

    setIsMutating(true);

    if (res) toast.success("Book deleted successfully.");
    else toast.error("Something went wrong while deleting the book!");

    router.push("/library");
    setIsMutating(false);
  }

  return (
    <div className="h-full bg-background text-foreground font-sans px-6 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-4 text-label-sm font-label tracking-wide text-on-surface-variant mb-4">
          <div className="hover:text-primary cursor-pointer">
            <Link href="/library" className="flex items-center gap-2">
              <MoveLeft size={16} /> <span>LIBRARY /</span>
            </Link>
          </div>
          <div className="text-primary font-medium">BOOK EDITOR</div>
        </div>

        {/* Heading */}
        <h1 className="text-headline-lg font-heading font-semibold text-on-surface mb-1">
          Edit book details
        </h1>
        <p className="text-body-md font-body text-on-surface-variant mb-8">
          Modify the essential information for your digital copy. Changes are
          synced across your Lumina Cloud devices instantly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Cover column */}
          <div>
            <div
              className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex items-center justify-center group"
              onClick={handleBookImageChange}
            >
              <div className="w-full aspect-2/3 rounded-sm relative">
                <Image
                  src={book.coverUrl}
                  alt="Book cover url"
                  fill
                  className="object-cover rounded-sm"
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity duration-150 rounded-sm flex flex-col items-center justify-center">
                  <Button className="cursor-pointer rounded-md px-4">
                    {" "}
                    <Upload /> <span>Upload Image (&lt;1mb)</span>
                  </Button>
                </div>
                <div className="lg:hidden absolute top-4 right-4 bg-background p-2 rounded-lg">
                  <Pencil />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file !== null && (
                  <Button
                    className="absolute bottom-2 left-0 right-0 w-[90%] mx-auto rounded-md"
                    onClick={handleUploadImage}
                  >
                    Upload
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <div>
                <Link href={`/reader/${book.id}`}>
                  <Button className="mt-4 rounded-md h-14 md:h-10 w-full cursor-pointer">
                    Continue Reading
                  </Button>
                </Link>
              </div>
              <div className="flex mt-4 gap-4 justify-between text-label-md font-label text-on-surface-variant">
                <div>Format: {book.format}</div>
                <div>Pages: {book.totalPages}</div>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <h2 className="text-headline-md font-heading font-medium text-on-surface mb-3">
                General information
              </h2>
              <div className="h-px bg-outline-variant mb-6" />

              <div className="space-y-5">
                <div>
                  <label className="block text-label-sm font-label tracking-wide text-on-surface-variant mb-2">
                    BOOK TITLE
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 rounded-md border border-outline-variant bg-surface-container-low px-3 text-body-md font-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-label-sm font-label tracking-wide text-on-surface-variant mb-2">
                    AUTHOR
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full h-11 rounded-md border border-outline-variant bg-surface-container-low px-3 text-body-md font-body text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-6 mt-8">
                <button
                  className="text-label-md font-label font-medium text-primary hover:underline cursor-pointer"
                  disabled={isMutating}
                >
                  Cancel
                </button>
                <button
                  className="h-11 px-5 rounded-md bg-primary text-primary-foreground text-label-md font-label font-medium hover:opacity-90 transition cursor-pointer"
                  onClick={handleUpdate}
                  disabled={isMutating}
                >
                  Save changes
                </button>
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-error-container/10 border border-error-container rounded-xl p-6">
              <h2 className="text-headline-md font-heading font-medium text-on-surface mb-4">
                Manage and dangerous actions
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-body-md font-body font-medium text-on-surface mb-1">
                    Permanent actions
                  </p>
                  <p className="text-body-sm font-body text-on-surface-variant max-w-xs">
                    Resetting your history or deleting the book cannot be
                    undone. Please proceed with caution.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <DangerAlertDialog
                    title="Reset reading History"
                    text="This action cannot be undone. This will reset your history of the book."
                    additionalClassesForButton="border border-outline-variant text-label-md font-label font-medium text-on-surface hover:bg-surface-container-low transition"
                    disabled={isMutating}
                    onClick={handleResetHistory}
                  />
                  <DangerAlertDialog
                    title="Delete Book"
                    text="This action cannot be undone. This will permanently delete this book from your library."
                    additionalClassesForButton="bg-error text-error-foreground text-label-md font-label font-medium"
                    disabled={isMutating}
                    onClick={handleDelete}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
