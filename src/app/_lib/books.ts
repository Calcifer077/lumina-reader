import { PDFParse } from "pdf-parse";
import { count } from "drizzle-orm";
import EPub from "epub2";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { randomUUID } from "crypto";

import { db } from "@/app/_lib/db";
import type { BookFromApi } from "@/app/_lib/types";
import { formatSize, formatDate } from "@/app/_lib/utils";

import { books } from "@/app/_db/schema";

export async function getTotalBooks(): Promise<number> {
  const [data] = await db.select({ total: count() }).from(books);

  return data.total;
}

export async function getBooks(): Promise<BookFromApi[]> {
  const data = await db.select().from(books);

  //We will convert the books that come from the api to the format that is needed by the frontend.

  const res: BookFromApi[] = [];

  for (const obj of data) {
    const newObj: BookFromApi = {
      id: obj.id,
      title: obj.title || "",
      author: obj.author || "",
      coverUrl: obj.cover_url || "/placeholder-book.png",
      format: obj.format,
      progress: 0,
      fileSize: formatSize(obj.file_size),
      totalPages: obj.total_pages || 0,
      uploadedAt: formatDate(obj.uploaded_at),
      lastOpenedAt: formatDate(obj.last_opened_at),
    };

    res.push(newObj);
  }

  return res;
}

export async function getBook() {}

export async function changeBookImage() {}

export async function updateBook() {}

export async function deleteBook() {}

/**
 *
 * @param buffer
 * @returns page count of PDF
 */
export async function getPdfPageCount(buffer: Buffer): Promise<number | null> {
  try {
    const uint8Buffer = new Uint8Array(buffer);
    const parser = new PDFParse(uint8Buffer);
    const result = await parser.getInfo({ parsePageInfo: true });
    await parser.destroy();

    return result.total;
  } catch (err) {
    console.error("Failed to read PDF page count", err);
    return null;
  }
}

/**
 *
 * @param buffer
 * @returns Approximate page count of epub.
 * As there is no fixed size of epub, this will be a approximate figure.
 */
export async function getEpubPageCount(buffer: Buffer): Promise<number | null> {
  const tmpPath = path.join(tmpdir(), `${randomUUID}.epub`);
  await writeFile(tmpPath, buffer);

  try {
    const epub = await openEpub(tmpPath);

    return epub.spine.contents.length;
  } catch (err) {
    console.error("Failed to read EPUB spine:", err);
    return null;
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}

function openEpub(filePath: string): Promise<EPub> {
  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath);
    epub.on("end", () => resolve(epub));
    epub.on("error", (err: Error) => reject(err));
    epub.parse();
  });
}
