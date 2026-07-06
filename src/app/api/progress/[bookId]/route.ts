// This route will handle both get progress and save progress

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/app/_lib/types";
import type { ReadingProgress } from "@/app/_db/schema";

import { getProgress, saveProgress } from "@/app/_lib/progress";

interface RouteParams {
  params: { bookId: string };
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<ReadingProgress | null>>> {
  const { bookId } = params;

  try {
    const progress = await getProgress(bookId);

    return NextResponse.json({ success: true, data: progress });
  } catch (err) {
    console.error("GET /api/progress/[bookId] failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch progerss",
      },
      { status: 500 },
    );
  }
}

interface SaveProgressBody {
  location: string;
}

function isSaveProgressBody(value: unknown): value is SaveProgressBody {
  return typeof value === "object" && value !== null && "location" in value;
}

export async function POST(
  req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<ReadingProgress>>> {
  const { bookId } = await params;

  const body = await req.json();

  console.log(body);

  if (!isSaveProgressBody(body)) {
    console.log("one");
    return NextResponse.json(
      { success: false, error: "Expected {location: string}" },
      { status: 400 },
    );
  }

  const res = await saveProgress(bookId, body.location);

  return NextResponse.json({ success: true, data: res });
  try {
  } catch (err) {
    console.error("POST /api/progress/[bookId] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save progress" },
      { status: 500 },
    );
  }
}
