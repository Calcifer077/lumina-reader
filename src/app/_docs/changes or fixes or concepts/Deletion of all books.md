# `deleteAllBooks` — Deletion Strategy

This is based on the changes in the following commit:

- [Github](https://github.com/Calcifer077/lumina-reader/commit/76d438737830cefd01e5cceb66ff6ac29e9be7f3)

## Overview

`deleteAllBooks` removes every book from the system. A book's data lives in two places:

1. **Postgres** — the `books` table row
2. **Supabase Storage** — associated files, stored under a `id_from_storage` folder

These two stores can't be rolled back together as a single atomic unit (Postgres transactions have no knowledge of Supabase Storage operations). To avoid ending up with a DB row pointing at files that no longer exist, deletion is split into two ordered phases:

1. **Delete all DB rows inside a single Postgres transaction.** If any row fails to delete, the whole transaction rolls back and **no rows are removed** — the DB is left exactly as it was.
2. **Only after the transaction commits successfully**, delete the corresponding files from Supabase Storage for each book.

## Why this order?

| Failure point                        | Result                                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| DB delete fails partway through      | Transaction rolls back. All rows still exist. **No storage files have been touched yet**, so nothing is orphaned. |
| Storage delete fails partway through | All DB rows are already gone (committed). Some storage files may remain — **orphaned files**, not orphaned rows.  |

Orphaned storage files are the safer failure mode: they can be found and cleaned up later (e.g. a periodic sweep comparing storage folders against existing `id_from_storage` values). Orphaned DB rows (pointing to files that no longer exist) are worse, since the app would treat them as valid books with broken file references.

## Implementation

```typescript
export async function deleteAllBooks(): Promise<boolean> {
  try {
    const idsFromStorage: string[] = [];

    // Phase 1: delete all DB rows atomically.
    await db.transaction(async (tx) => {
      const data = await tx
        .select({ id: books.id, id_from_storage: books.id_from_storage })
        .from(books);

      for (const obj of data) {
        await tx.delete(books).where(eq(books.id, obj.id));
        idsFromStorage.push(obj.id_from_storage);
      }
    });

    // Phase 2: only reached if ALL DB deletes succeeded and committed.
    // Best-effort cleanup of storage files.
    for (const idFromStorage of idsFromStorage) {
      const { data: files } = await supabase.storage
        .from("books")
        .list(idFromStorage);

      if (files && files.length > 0) {
        const filesPath = files.map((f) => `${idFromStorage}/${f.name}`);
        await supabase.storage.from("books").remove(filesPath);
      }
    }

    return true;
  } catch (err) {
    console.error("There was a problem while deleting all books", err);
    return false;
  }
}
```

## Behavior summary

- **`true`** — all DB rows deleted, and the storage cleanup loop ran without throwing. (Individual storage removals aren't checked for errors — see "Known limitations" below.)
- **`false`** — DB transaction failed and rolled back. No rows were deleted. Storage was never touched in this case.

## Known limitations

- **Storage errors are not currently checked.** `supabase.storage.remove(...)` can return an `error` field that isn't inspected here. If it fails for a given book, that book's files will remain in storage but the function will still report overall success. If you need visibility into this, capture and return the list of `idFromStorage` values that failed to clean up:

```ts
const failedStorageIds: string[] = [];

for (const idFromStorage of idsFromStorage) {
  const { data: files } = await supabase.storage
    .from("books")
    .list(idFromStorage);
  if (files && files.length > 0) {
    const filesPath = files.map((f) => `${idFromStorage}/${f.name}`);
    const { error } = await supabase.storage.from("books").remove(filesPath);
    if (error) failedStorageIds.push(idFromStorage);
  }
}
```

- **Not usable inside a larger transaction.** Because `deleteAllBooks` opens its own transaction via `db.transaction`, it can't be composed into a bigger multi-step transaction elsewhere. This is fine for this function's current standalone use.
- **This function is separate from `deleteBook`.** `deleteBook` still handles single-book deletion (DB + storage together, best-effort) for other call sites that don't need transactional guarantees. `deleteAllBooks` does not call `deleteBook` — it reimplements the DB delete directly inside the transaction so it can use `tx` instead of `db`.
