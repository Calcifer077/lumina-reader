import { Suspense } from "react";

import { getBooks, getTotalBooks } from "@/app/_lib/books";

import GridView from "@/app/_components/library/GridView";
import GridViewSkeleton from "@/app/_components/library/GridViewSkeleton";

import ListView from "@/app/_components/library/ListView";
import ListViewSkeleton from "@/app/_components/library/ListViewSkeleton";

import Toolbar from "@/app/_components/library/Toolbar";
import EmptyLibrary from "@/app/_components/library/EmptyLibrary";

// import type { BookFromApi } from "@/app/_lib/types";

type Props = {
  searchParams: Promise<{
    view?: "grid" | "list";
    sort?: string;
  }>;
};

export default async function LibraryPage({ searchParams }: Props) {
  const { view = "grid" } = await searchParams;
  const totalBooks = await getTotalBooks();

  const booksPromise = getBooks();

  return (
    <div className="px-2 py-4 lg:px-6 lg:py-8 mb-12">
      {totalBooks > 0 && (
        <>
          <Toolbar />
          <div className="mt-6 p-4">
            {/* ALL THE BOOKS */}
            {view === "grid" && (
              <Suspense fallback={<GridViewSkeleton />}>
                <GridView booksPromise={booksPromise} />
              </Suspense>
            )}

            {view === "list" && (
              <Suspense fallback={<ListViewSkeleton />}>
                <ListView booksPromise={booksPromise} />
              </Suspense>
            )}
          </div>
        </>
      )}
      {totalBooks == 0 && (
        <div className="p-4">
          <EmptyLibrary />
        </div>
      )}
    </div>
  );
}
