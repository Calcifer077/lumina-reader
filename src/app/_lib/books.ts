"use server";

import { randomUUID } from "crypto";
import { count, eq } from "drizzle-orm";
import EPub from "epub2";
import { unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

import { books } from "@/app/_db/schema";
import { db } from "@/app/_lib/db";
import type { BookFromApi } from "@/app/_lib/types";
import { formatDate, formatSize } from "@/app/_lib/utils";

import { supabase } from "./supabase";

/**
 *
 * @returns number of total books
 */
export async function getTotalBooks(): Promise<number> {
  const [data] = await db.select({ total: count() }).from(books);

  return data.total;
}

/**
 *
 * @returns all books as `BookFromApi` data type. Check it in types file under '_lib' folder.
 */
export async function getBooks(): Promise<BookFromApi[]> {
  const data = await db.select().from(books);

  //We will convert the books that come from the api to the format that is needed by the frontend.

  const res: BookFromApi[] = [];

  for (const obj of data) {
    let cover = "";
    if (obj.cover_url) {
      const imageUrl = await supabase.storage
        .from("books")
        .createSignedUrl(obj.cover_url, 60 * 60);

      if (imageUrl?.data) cover = imageUrl?.data.signedUrl;
    }
    const newObj: BookFromApi = {
      id: obj.id,
      title: obj.title || "",
      author: obj.author || "",
      coverUrl: cover || "/placeholder-book.png",
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

/**
 *
 * @param id the id of the book that needs to be fetched
 * @returns the book as `BookFromApi`. Check it out under '_lib' folder.
 */
export async function getBook(id: string): Promise<BookFromApi> {
  const [data] = await db.select().from(books).where(eq(books.id, id));
  let cover = "";
  if (data.cover_url) {
    const imageUrl = await supabase.storage
      .from("books")
      .createSignedUrl(data.cover_url, 60 * 60);

    if (imageUrl?.data) cover = imageUrl?.data.signedUrl;
  }

  const res: BookFromApi = {
    id: data.id,
    title: data.title,
    author: data.author || "",
    coverUrl: cover || "/placeholder-book.png",
    format: data.format,
    progress: 0,
    fileSize: formatSize(data.file_size),
    totalPages: data.total_pages || 0,
    uploadedAt: formatDate(data.uploaded_at),
    lastOpenedAt: formatDate(data.last_opened_at),
  };

  return res;
}

/**
 *
 * @param id The id the book for whom data needs to be fetched.
 * @returns format of the book and signed url for access as a object.
 */
export async function getFormatAndSignedUrl(
  id: string,
): Promise<{ signedUrl: string | null; format: string | null } | null> {
  const [data] = await db
    .select({ filePath: books.file_path, format: books.format })
    .from(books)
    .where(eq(books.id, id));

  if (!data) return null;

  const filePath = data.filePath;

  const { data: dataFromStorage, error } = await supabase.storage
    .from("books")
    .createSignedUrl(filePath, 60 * 60);

  if (error) return null;

  return {
    signedUrl: dataFromStorage.signedUrl,
    format: data.format,
  };
}

/**
 *
 * @param id The id the book for whom data needs to be fetched.
 * @returns Storage id of the book
 * It is not exported, it just acts like a helper function
 */
async function getBookStorageId(id: string): Promise<string | boolean> {
  const [data] = await db
    .select({ idFromStorage: books.id_from_storage })
    .from(books)
    .where(eq(books.id, id));

  return data.idFromStorage;
}

/**
 *
 * @param bookId The id of the book that needs to be updated.
 * @param file The new cover image of book
 * @returns a boolean depending on whether the operation of updating book cover image was successfull or not.
 */
export async function updateBookImage(
  bookId: string,
  file: File,
): Promise<boolean> {
  try {
    const idFromStorage = await getBookStorageId(bookId);

    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `${idFromStorage}/${safeFilename}`;

    const { error: uploadError } = await supabase.storage
      .from("books")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.log("Error while uploading the file", uploadError);
      return false;
    }

    await db
      .update(books)
      .set({
        cover_url: filePath,
      })
      .where(eq(books.id, bookId));

    return true;
  } catch (err) {
    console.error("Error occured while updating cover image", err);

    return false;
  }
}

/**
 *
 * @returns a boolean depending on whether the opeartion of deleting all books was successfull or not.
 * For more detail check under '_docs/changes or fixes or concepts/Deletion of all books.md'
 */
export async function deleteAllBooks(): Promise<boolean> {
  try {
    const idsFromStorage: string[] = [];

    await db.transaction(async (tx) => {
      const data = await tx
        .select({ id: books.id, id_from_storage: books.id_from_storage })
        .from(books);

      for (const obj of data) {
        await tx.delete(books).where(eq(books.id, obj.id));
        idsFromStorage.push(obj.id_from_storage);
      }
    });

    // Only reached if ALL DB deletes succeeded and committed
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

/**
 * Updates books in database
 *
 * @param id
 * @param title
 * @param author
 * @returns a boolean depending on whether the operation was successful or not
 */
export async function updateBook(
  id: string,
  title: string,
  author: string,
): Promise<boolean> {
  try {
    if (title.trim().length === 0 || author.trim().length === 0) return false;

    await db
      .update(books)
      .set({
        title: title,
        author: author,
      })
      .where(eq(books.id, id));

    return true;
  } catch (err) {
    console.error("Error while updating book", err);
    return false;
  }
}

/**
 * Deletes books from database
 *
 * @param id
 * @return a boolean depending on whether the operation was successful or not
 *
 */
export async function deleteBook(id: string): Promise<boolean> {
  try {
    const [data] = await db.select().from(books).where(eq(books.id, id));

    const idFromStorage = data.id_from_storage;

    // First get all the files that are associated with this id.
    const { data: files, error: storageFetchingError } = await supabase.storage
      .from("books")
      .list(idFromStorage);

    if (storageFetchingError) return false;

    // If there are files, than delete them.
    if (files && files.length > 0) {
      // We can just pass a array of path of files that are to be deleted.
      const filesPath = files.map((file) => `${idFromStorage}/${file.name}`);

      const { error: storageDeletingError } = await supabase.storage
        .from("books")
        .remove(filesPath);

      if (storageDeletingError) return false;
    }

    await db.delete(books).where(eq(books.id, id));

    return true;
  } catch (err) {
    console.error("Error while deleting book", err);
    return false;
  }
}

/**
 *
 * @param buffer
 * @returns page count of PDF
 */
export async function getPdfPageCount(buffer: Buffer): Promise<number | null> {
  try {
    // Polyfill DOMMatrix before pdf-parse (pdfjs-dist) loads
    if (typeof globalThis.DOMMatrix === "undefined") {
      // @ts-expect-error minimal stub, pdfjs only needs the constructor to exist
      globalThis.DOMMatrix = class DOMMatrix {
        constructor() {}
      };
    }

    const { PDFParse } = await import("pdf-parse");

    const uint8Buffer = new Uint8Array(buffer);
    const parser = new PDFParse(uint8Buffer);
    const result = await parser.getInfo({ parsePageInfo: true });
    await parser.destroy();

    return result.total;

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
  const tmpPath = path.join(tmpdir(), `${randomUUID()}.epub`);
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

function getImage(
  epub: EPub,
  id: string,
): Promise<{ data: Buffer | undefined; mimeType: string | undefined }> {
  return new Promise((resolve, reject) => {
    epub.getImage(id, (err, data, mimeType) => {
      if (err) return reject(err);
      resolve({ data, mimeType });
    });
  });
}

export async function getEpubCoverImage(
  buffer: Buffer,
): Promise<{ data: Buffer | undefined; mimeType: string | undefined } | null> {
  const tmpPath = path.join(tmpdir(), `${randomUUID()}.epub`);
  await writeFile(tmpPath, buffer);

  try {
    const epub = await openEpub(tmpPath);

    const coverId = epub.metadata.cover; // manifest id, e.g. "cover-image"
    if (!coverId) return null;

    const { data, mimeType } = await getImage(epub, coverId);
    return { data, mimeType };
  } catch (err) {
    console.error("Failed to extract EPUB cover:", err);
    return null;
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}
