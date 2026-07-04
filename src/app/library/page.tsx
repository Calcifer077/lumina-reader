import { Suspense } from "react";

import { getBooks } from "@/app/_lib/books";
import GridViewSkeleton from "@/app/_components/library/GridViewSkeleton";
import GridView from "@/app/_components/library/GridView";
import ListViewSkeleton from "@/app/_components/library/ListViewSkeleton";
import ListView from "@/app/_components/library/ListView";
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
  const books = await getBooks();

  return (
    <div className="px-2 py-4 lg:px-6 lg:py-8 mb-12">
      {books.length > 0 && (
        <>
          <Toolbar />
          <div className="mt-6 p-4">
            {/* ALL THE BOOKS */}
            {view === "grid" && (
              <Suspense fallback={<GridViewSkeleton />}>
                <GridView books={books} />
              </Suspense>
            )}

            {view === "list" && (
              <Suspense fallback={<ListViewSkeleton />}>
                <ListView books={books} />
              </Suspense>
            )}
          </div>
        </>
      )}
      {books.length == 0 && (
        <div className="p-4">
          <EmptyLibrary />
        </div>
      )}
    </div>
  );
}
