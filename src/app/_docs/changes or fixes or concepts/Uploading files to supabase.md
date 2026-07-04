# Uploading files to supabase

## Initialize Drizzle and Supabase

We have used drizzle as a ORM, so first we have to initialize that to talk to supabase.

```ts
// /lib/db.ts
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing environment variable: DATABASE_URL");
}

export const db = drizzle({
  connection: connectionString,
});
```

You can learn more about it here: [](https://github.com/Calcifer077/lumina-reader/blob/main/src/app/_docs/changes%20or%20fixes%20or%20concepts/Getting%20started%20with%20drizzle.md)

To talk to supabase, we will create a client. There is basically two ways to create a client of supabase, one with anon or publishable key or with secret key.

We will use the secret key because our application will talk to the supabase through backend, there is no user involved. By using secret key it will pass the RLS.

```ts
// /_lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!serviceRoleKey) {
  throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
}

export const supabase = createClient(supabaseUrl!, serviceRoleKey!);
```

## Create route for handling file uploads

We will use nextjs api routes for handling file uploads. We can call this route from anywhere in our application.

```ts
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
        format: ext as "pdf" | "epub",
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
```

We have passed `formData` from our frontend to our route (discussed below) and than after some validation used supabase to send that file over to storage, than drizzle will create a entry in a table.

In the frontend we just have to call our api.

```tsx
const res = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});
```

Our UI allows for multiple file uploads at once but we will upload one by one.

```tsx
async function handleSubmit(): Promise<void> {
  setIsSubmitting(true);

  // Only upload those files which are either in 'waiting' state or 'error' state.
  const pending = files.filter(
    (f) => f.status === "waiting" || f.status === "error",
  );
  // Upload sequentially so we don't hammer the API with 10 concurrent multipart requests.
  for (const f of pending) {
    await uploadOne(f);
  }

  setIsSubmitting(false);
  router.refresh();
}
```

Function responsible for uploading or calling of route.

```tsx
async function uploadOne(uploadFile: UploadFile): Promise<boolean> {
  const formData = new FormData();
  formData.append("file", uploadFile.file);
  formData.append("title", uploadFile.title);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const result: ApiResponse<Book> = await res.json();

    if (!result.success) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
```

    I have removed some state settings, to check full code go to the file of `UploadDocumentsModal`.

Above code is pretty simple, we just create `formData` in the format that is required by our backend and call the route.
