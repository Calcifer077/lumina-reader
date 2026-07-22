import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { books } from "@/app/_db/schema";
import type { Book } from "@/app/_db/schema";
import {
  getEpubCoverImage,
  getEpubPageCount,
  getPdfPageCount,
} from "@/app/_lib/books";
import { db } from "@/app/_lib/db";
import { supabase } from "@/app/_lib/supabase";
import type { ApiResponse } from "@/app/_lib/types";
import { getExtension } from "@/app/_lib/utils";

export const runtime = "nodejs";

const ALLOWED_EXTENSIONS = ["pdf", "epub"] as const;
type AllowedFormat = (typeof ALLOWED_EXTENSIONS)[number];

function isAllowedFormat(ext: string): ext is AllowedFormat {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse<Book>>> {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const title = formData.get("title");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }
    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 },
      );
    }

    const ext = getExtension(file.name);
    if (!isAllowedFormat(ext)) {
      return NextResponse.json(
        { success: false, error: "Only .pdf and .epub files are supported" },
        { status: 400 },
      );
    }

    const bookId = randomUUID();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${bookId}/${safeFilename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Page count only — no rendering/canvas, so this is Vercel-safe.
    // Non-fatal on failure: a missing page count shouldn't block the upload.
    const totalPages =
      ext === "pdf"
        ? await getPdfPageCount(buffer)
        : await getEpubPageCount(buffer);

    const { error: uploadBookError } = await supabase.storage
      .from("books")
      .upload(filePath, buffer, {
        contentType:
          file.type ||
          (ext === "pdf" ? "application/pdf" : "application/epub+zip"),
        upsert: false,
      });

    if (uploadBookError) {
      return NextResponse.json(
        {
          success: false,
          error: `Storage upload failed: ${uploadBookError.message}`,
        },
        { status: 500 },
      );
    }

    let cover;
    let coverFilePath = "";

    if (ext === "epub") {
      cover = await getEpubCoverImage(buffer);
    }

    if (cover?.data) {
      coverFilePath = `${bookId}/coverUrl`;

      const { error: uploadCoverImageError } = await supabase.storage
        .from("books")
        .upload(coverFilePath, cover.data, {
          contentType:
            file.type ||
            (ext === "pdf" ? "application/pdf" : "application/epub+zip"),
          upsert: false,
        });

      if (uploadCoverImageError) {
        return NextResponse.json(
          {
            success: false,
            error: `Storage upload failed: ${uploadCoverImageError.message}`,
          },
          { status: 500 },
        );
      }
    }

    const [newBook] = await db
      .insert(books)
      .values({
        id: bookId,
        title: title.trim(),
        author: "empty for now",
        format: ext,
        id_from_storage: bookId,
        file_path: filePath,
        cover_url: coverFilePath,
        file_size: buffer.byteLength,
        total_pages: totalPages,
      })
      .returning();

    if (!newBook) {
      return NextResponse.json(
        { success: false, error: "Failed to save book metadata" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: newBook }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
