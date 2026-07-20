"use server";

import { eq } from "drizzle-orm";

import { readingProgress } from "@/app/_db/schema";
import type { ReadingProgress } from "@/app/_db/schema";
import { db } from "@/app/_lib/db";

/**
 *
 * @param bookId The id of the book for whom the progress will be fetched
 * @returns The progress of the book. It can either be a number for pdf or cfi string for epub.
 */
export async function getProgress(bookId: string): Promise<ReadingProgress> {
  const [data] = await db
    .select()
    .from(readingProgress)
    .where(eq(readingProgress.book_id, bookId));

  return data;
}

/**
 *
 * @param bookId The id of the book for whom progress will be saved.
 * @param location The updated progress location
 * @returns updated progress
 */
export async function saveProgress(
  bookId: string,
  location: string,
): Promise<ReadingProgress> {
  const [data] = await db
    .select()
    .from(readingProgress)
    .where(eq(readingProgress.book_id, bookId));

  // progress doesn't exist, create one
  if (!data) {
    const [res] = await db
      .insert(readingProgress)
      .values({ book_id: bookId, location: location });

    return res;

    // progress does exist, update it
  } else {
    const [res] = await db
      .update(readingProgress)
      .set({ location: location })
      .where(eq(readingProgress.book_id, bookId));

    return res;
  }
}

/**
 *
 * @param bookId The id of the book whose reading history will be deleted
 * @returns a boolean depending on whether the operation of resetting history was successfull or not.
 */
export async function resetHistoryForABook(bookId: string): Promise<boolean> {
  try {
    await db.delete(readingProgress).where(eq(readingProgress.book_id, bookId));
    return true;
  } catch (err) {
    console.log(`Error while reseting history for book: ${bookId}`, err);
    return false;
  }
}

/**
 *
 * @returns a boolean depending on whether the resetting of all history was successfull or not.
 */
export async function resetHistory(): Promise<boolean> {
  try {
    await db.delete(readingProgress);
    return true;
  } catch (err) {
    console.log("Error while resetting history", err);
    return false;
  }
}
