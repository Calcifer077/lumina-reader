import { Suspense } from "react";

import GridViewSkeleton from "@/app/_components/library/GridViewSkeleton";
import GridView from "@/app/_components/library/GridView";
import ListViewSkeleton from "@/app/_components/library/ListViewSkeleton";
import ListView from "@/app/_components/library/ListView";
import Toolbar from "@/app/_components/library/Toolbar";
import EmptyLibrary from "@/app/_components/library/EmptyLibrary";

import { Book } from "@/app/_lib/types";

const fakeBookData: Book[] = [
  {
    id: "1",
    title: "Sharp Objects",
    author: "Gillian Flynn",
    coverUrl: "/sharp-objects-image.jpg",
    format: "pdf",
    progress: 0.5,
    fileSize: 5242880, // 5 MB
    totalPages: 254,
    uploadedAt: "2026-06-20T10:30:00Z",
    lastOpenedAt: "2026-07-01T18:15:00Z",
  },
  {
    id: "2",
    title: "Of Mice and Men",
    author: "John Steinbeck",
    coverUrl: "/of-mice-and-men-image.jpg",
    format: "pdf",
    progress: 0.1,
    fileSize: 2097152, // 2 MB
    totalPages: 112,
    uploadedAt: "2026-06-15T09:00:00Z",
    lastOpenedAt: "2026-06-30T20:10:00Z",
  },
  {
    id: "3",
    title: "Fake Book 3",
    author: "Fake Author 3",
    coverUrl: "/of-mice-and-men-image.jpg",
    format: "pdf",
    progress: 0.9,
    fileSize: 7340032, // 7 MB
    totalPages: 368,
    uploadedAt: "2026-06-10T14:45:00Z",
    lastOpenedAt: "2026-07-02T08:20:00Z",
  },
  {
    id: "4",
    title: "Fake Book 4",
    author: "Fake Author 4",
    coverUrl: "/of-mice-and-men-image.jpg",
    format: "epub",
    progress: 0,
    fileSize: 3145728, // 3 MB
    totalPages: 285,
    uploadedAt: "2026-06-12T16:00:00Z",
    lastOpenedAt: null,
  },
  {
    id: "5",
    title: "Fake Book 5",
    author: "Fake Author 5",
    coverUrl: "/of-mice-and-men-image.jpg",
    format: "epub",
    progress: 0,
    fileSize: 4194304, // 4 MB
    totalPages: 412,
    uploadedAt: "2026-06-18T12:20:00Z",
    lastOpenedAt: null,
  },
  {
    id: "6",
    title: "Fake Book 6",
    author: "Fake Author 6",
    coverUrl: "/of-mice-and-men-image.jpg",
    format: "pdf",
    progress: 0,
    fileSize: 6, // 6 MB
    totalPages: 198,
    uploadedAt: "2026-06-22T11:40:00Z",
    lastOpenedAt: null,
  },
  {
    id: "7",
    title: "Fake Book 7",
    author: "Fake Author 7",
    coverUrl: "/rebecca-image.jpg",
    format: "pdf",
    progress: 0,
    fileSize: 8, // 8 MB
    totalPages: 521,
    uploadedAt: "2026-06-25T08:10:00Z",
    lastOpenedAt: null,
  },
  {
    id: "8",
    title: "Fake Book 8",
    author: "Fake Author 8",
    coverUrl: "/rebecca-image.jpg",
    format: "pdf",
    progress: 0,
    fileSize: 3670016, // 3.5 MB
    totalPages: 176,
    uploadedAt: "2026-06-28T17:30:00Z",
    lastOpenedAt: null,
  },
];

// const fakeBookData: Book[] = []; // Empty library for testing

type Props = {
  searchParams: Promise<{
    view?: "grid" | "list";
    sort?: string;
  }>;
};

export default async function LibraryPage({ searchParams }: Props) {
  const { view = "grid" } = await searchParams;

  return (
    <div className="px-2 py-4 lg:px-6 lg:py-8 mb-12">
      {fakeBookData.length > 0 && (
        <>
          <Toolbar />
          <div className="mt-6 p-4">
            {/* ALL THE BOOKS */}
            {view === "grid" && (
              <Suspense fallback={<GridViewSkeleton />}>
                <GridView books={fakeBookData} />
              </Suspense>
            )}

            {view === "list" && (
              <Suspense fallback={<ListViewSkeleton />}>
                <ListView books={fakeBookData} />
              </Suspense>
            )}
          </div>
        </>
      )}
      {fakeBookData.length == 0 && (
        <div className="p-4">
          <EmptyLibrary />
        </div>
      )}
    </div>
  );
}
