import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/app/_lib/types";
import type { Book } from "@/app/_lib/types";
import { supabase } from "@/app/_lib/supabase";
import { db } from "@/app/_lib/db";
import { randomUUID } from "crypto";
import { books } from "@/app/_db/schema";

const ALLOWED_EXTENSIONS = ["pdf", "epub"];
type AllowedFormat = (typeof ALLOWED_EXTENSIONS)[number];

function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts[parts.length - 1]?.toLowerCase() ?? "";
}

function isAllowedFormat(ext: string): ext is AllowedFormat {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: "This is a GET request for upload",
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const title = formData.get("title");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 },
      );
    }

    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Title is required",
        },
        { status: 400 },
      );
    }

    const ext = getExtension(file.name);

    if (!isAllowedFormat(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only .pdf and .epub files are supported",
        },
        { status: 400 },
      );
    }

    const bookId = crypto.randomUUID();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${bookId}/${safeFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("books")
      .upload(filePath, buffer, {
        contentType:
          file.type ||
          (ext === "pdf" ? "application/pdf" : "application/epub+zip"),
        upsert: false,
      });

    console.log(uploadError);

    if (uploadError) {
      return NextResponse.json(
        {
          success: false,
          error: uploadError.message,
        },
        { status: 500 },
      );
    }

    const [newBook] = await db
      .insert(books)
      .values({
        title: title.trim(),
        author: "empty for now",
        format: ext as "pdf" | "epub", // ext is now typed as "pdf" | "epub"
        id_from_storage: bookId,
        file_path: filePath,
        file_size: buffer.byteLength,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newBook,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
