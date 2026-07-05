# Data fetching for views

In earlier versions of the application, data was fetched (fake data) by the `page` component under `library` route.

Older version: [`LibraryPage.tsx`](https://github.com/Calcifer077/lumina-reader/blob/f3f86b6d0fc3ef324acb20b7453b0fe53598ea50/src/app/library/page.tsx), [`GridView.tsx`](https://github.com/Calcifer077/lumina-reader/blob/f3f86b6d0fc3ef324acb20b7453b0fe53598ea50/src/app/_components/library/GridView.tsx)
Newer version: [`LibraryPage.tsx`](https://github.com/Calcifer077/lumina-reader/blob/main/src/app/library/page.tsx), [`GridView.tsx`](https://github.com/Calcifer077/lumina-reader/blob/main/src/app/_components/library/GridView.tsx)

The problem with the older version was that as long as we have a `async` task running on the top level of the component, it will block the rest of the component, so there will be no skeletons which we have defined for different views.

```tsx
export default async function LibraryPage({ searchParams }: Props) {
  const { view = "grid" } = await searchParams;

  // will block the component if there is 'await' here.

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
```

To solve this issue, we will delegate the async work down the component tree. Both `GridView` and `ListView` will fetch data of their own. We will just pass the promise down the line.

```tsx
export default async function LibraryPage({ searchParams }: Props) {
  const { view = "grid", sort = "recently_added" } = await searchParams;
  const totalBooks = await getTotalBooks();

  const booksPromise = getBooks();

  return (
    <div className="px-2 py-4 lg:px-6 lg:py-8 mb-12">
      {totalBooks > 0 && (
        <>
          <Suspense fallback={<ToolbarSkeleton />}>
            <Toolbar />
          </Suspense>
          <div className="mt-6 p-4">
            {/* ALL THE BOOKS */}
            {view === "grid" && (
              <Suspense fallback={<GridViewSkeleton />}>
                <GridView booksPromise={booksPromise} sort={sort} />
              </Suspense>
            )}

            {view === "list" && (
              <Suspense fallback={<ListViewSkeleton />}>
                <ListView booksPromise={booksPromise} sort={sort} />
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
```

We also have passed search params so that sorting can also take place accordingly, further down the line, if we even had to filter out on different conditions, we can just pass them from here only.

GridView

```tsx
import Image from "next/image";

import type { BookFromApi } from "@/app/_lib/types";

export default async function GridView({
  booksPromise,
  sort,
}: {
  booksPromise: Promise<BookFromApi[]>;
  sort: string;
}) {
  const books = await booksPromise;

  const sortedBooks = [...books].sort((a, b) => {
    switch (sort) {
      case "recently_added":
        return (
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

      case "recently_opened":
        return (
          new Date(b.lastOpenedAt ?? "1970-01-01").getTime() -
          new Date(a.lastOpenedAt ?? "1970-01-01").getTime()
        );

      case "title_a-z":
        return a.title.localeCompare(b.title);

      case "title_z-a":
        return b.title.localeCompare(a.title);

      default:
        return 0;
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {sortedBooks.map((book) => (
        <div key={book.id} className="group mb-8 w-full">
          <div className="aspect-4/5 w-full relative rounded-xl overflow-hidden">
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
            />
            <div
              className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-label-sm font-label uppercase tracking-wide ${
                book.format === "pdf"
                  ? "bg-tertiary-container text-on-tertiary-container"
                  : "bg-secondary-container text-on-secondary-container"
              }`}
            >
              {book.format}
            </div>
            {book.progress > 0 && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-container-highest">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${book.progress * 100}%` }}
                />
              </div>
            )}
          </div>
          <div className="h-6 w-full mt-2 text-foreground font-bold capitalize truncate transition-colors group-hover:text-primary cursor-pointer">
            {book.title}
          </div>
          <div className="h-4 mt-2 text-on-surface-variant text-body-sm">
            {book.author}
          </div>
        </div>
      ))}
    </div>
  );
}
```
