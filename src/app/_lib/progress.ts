"use server";

import { eq } from "drizzle-orm";

import { readingProgress } from "@/app/_db/schema";
import type { ReadingProgress } from "@/app/_db/schema";
import { db } from "@/app/_lib/db";

export async function getProgress(bookId: string): Promise<ReadingProgress> {
  const [data] = await db
    .select()
    .from(readingProgress)
    .where(eq(readingProgress.book_id, bookId));

  return data;
}

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

export async function resetHistoryForABook(bookId: string): Promise<boolean> {
  try {
    await db.delete(readingProgress).where(eq(readingProgress.book_id, bookId));
    return true;
  } catch (err) {
    console.log(`Error while reseting history for book: ${bookId}`, err);
    return false;
  }
}

export async function resetHistory(): Promise<boolean> {
  try {
    await db.delete(readingProgress);
    return true;
  } catch (err) {
    console.log("Error while resetting history", err);
    return false;
  }
}
