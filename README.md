# 📚 Lumina Reader

A personal, self-hosted ebook reader. Upload PDF and EPUB files, read them in your browser, and pick up exactly where you left off — no accounts, no multi-tenant complexity, just your books on your own Supabase project.

> This is a personal tool, not a SaaS. There is no authentication and no concept of multiple users. To use it, clone the repo and connect your own Supabase project via environment variables.

---

## ✨ Features

- Upload PDF and EPUB files
- In-browser reading for both formats (PDF.js / epub.js)
- Automatic reading position saving and resume (page number or EPUB CFI)
- Library view of all your books, with progress and last-opened info
- Dark mode
- Delete books (removes file + DB records)
- Files served via short-lived signed URLs — not publicly accessible

---

## 🛠️ Tech Stack

| Layer          | Technology                                                 |
| -------------- | ---------------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org/) (App Router)             |
| Language       | TypeScript (strict mode, no `any`)                         |
| Styling        | Tailwind CSS                                               |
| ORM            | [Drizzle ORM](https://orm.drizzle.team/)                   |
| Database       | [Supabase](https://supabase.com/) (Postgres)               |
| File Storage   | Supabase Storage                                           |
| PDF Rendering  | [React PDF](https://www.npmjs.com/package/react-pdf)       |
| EPUB Rendering | [React Reader](https://www.npmjs.com/package/react-reader) |

---

## 📁 Project Structure

```
lumina-reader/
├── .gitignore
├── README.md
├── drizzle.config.ts
├── package.json
└── src/
    └── app/
        ├── (shared sidebar)/
        │   ├── layout.tsx                    # Shared sidebar layout
        │   │
        │   ├── library/
        │   │   ├── loading.tsx
        │   │   └── page.tsx                  # Library page
        │   │
        │   ├── book/
        │   │   └── [bookId]/
        │   │       ├── loading.tsx
        │   │       └── page.tsx              # Book details & reader page
        │   │
        │   └── settings/
        │       ├── loading.tsx
        │       └── page.tsx                  # Settings page
        │
        ├── _components/
        │   ├── book/
        │   │   ├── BookPageView.tsx
        │   │   └── BookPageViewSkeleton.tsx
        │   │
        │   ├── library/
        │   │   ├── EmptyLibrary.tsx
        │   │   ├── GridView.tsx
        │   │   ├── GridViewSkeleton.tsx
        │   │   ├── ListView.tsx
        │   │   ├── ListViewSkeleton.tsx
        │   │   ├── Toolbar.tsx
        │   │   └── ToolbarSkeleton.tsx
        │   │
        │   ├── reader/
        │   │   ├── PdfViewer.tsx             # PDF renderer
        │   │   └── EpubViewer.tsx            # EPUB renderer
        │   │
        │   ├── settings/
        │   │   ├── SettingsPageView.tsx
        │   │   ├── SettingsPageViewSkeleton.tsx
        │   │   └── UploadProfilePictureModal.tsx
        │   │
        │   └── ui/
        │       ├── Navbar.tsx
        │       ├── NavbarSkeleton.tsx
        │       ├── Sidebar.tsx
        │       ├── SidebarSkeleton.tsx
        │       ├── UploadDocumentsModal.tsx
        │       └── CustomSelect.tsx
        │
        ├── _db/
        │   └── schema.ts
        │
        ├── _docs/
        │   ├── app/                          # Overall application documentation
        │   └── notes/                        # Concepts, fixes, and learnings
        │
        ├── _lib/
        │   ├── hooks/
        │   │   ├── useKeyPress.ts
        │   │   ├── useLocalStorage.ts
        │   │   ├── useOnClickOutside.ts
        │   │   └── useTheme.ts
        │   │
        │   ├── books.ts                      # Books data layer
        │   ├── db.ts                         # Drizzle database client
        │   ├── progress.ts                   # Reading progress data layer
        │   ├── supabase.ts                   # Supabase client
        │   ├── types.ts                      # Shared TypeScript types
        │   ├── userDetails.ts                # User data layer
        │   └── utils.ts                      # Shared utility functions
        │
        ├── api/
        │   ├── progress/
        │   │   └── [bookId]/
        │   │       └── route.ts              # Progress sync endpoint
        │   │
        │   └── upload/
        │       └── route.ts                  # Book upload endpoint
        │
        ├── reader/
        │   └── [bookId]/
        │
        ├── error.tsx
        ├── NotFound.tsx
        ├── layout.tsx
        └── page.tsx
```

---

## 🗄️ Database Schema

**`books`** — one row per uploaded book (title, author, format, storage path, cover, size, page count, timestamps).

**`reading_progress`** — one row per book, upserted on every save. Stores a `location` as plain text: a page number for PDFs, a CFI string for EPUBs. Deleting a book cascades and removes its progress row.

Schema lives in `/db/schema.ts` and is managed with Drizzle Kit migrations.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com/) project

### 1. Clone and install

```bash
git clone <your-repo-url> ebook-reader
cd ebook-reader
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=your-supabase-database-url
MAX_SIZE_MB=max-size-for-each-file
```

You'll find these in your Supabase project under **Settings → API** and **Settings → Database**.

### 3. Set up the database

Push the Drizzle schema to your Supabase Postgres instance:

```bash
npx drizzle-kit push
```

This creates the `books` and `reading_progress` tables.

### 4. Create the storage bucket

In your Supabase dashboard, go to **Storage** and create a new bucket named `books`. Set it to **private** (not public) — files are served to the reader via signed URLs generated on request.

### 5. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000/library](http://localhost:3000/library) to start uploading books.

---

## 🔒 How File Access Works

Since there's no authentication, the `books` storage bucket is kept private. The app generates a signed URL (valid for 1 hour) for a file only when the reader actually needs it, rather than exposing a public URL.

## 🔄 How Progress Saving Works

Reading position is saved via a debounced API call (2 seconds after you stop moving) directly to Postgres, with a `localStorage` fallback so the reader can resume instantly even before the database call completes. On load, the app tries the database first and falls back to `localStorage` if that fails.

---

Feel free to suggest changes and features.

## Entire folder structure

This is just for my understanding, feel free to skip

```
lumina-reader/
├── .gitignore
├── .prettierrc
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── components.json
├── drizzle.config.ts
├── drizzle/
│   ├── 20260704040225_abandoned_corsair/
│   │   ├── migration.sql
│   │   └── snapshot.json
│   └── 20260717091833_productive_orphan/
│       ├── migration.sql
│       └── snapshot.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── public/
│   ├── 115633814.jpg
│   ├── file.svg
│   ├── globe.svg
│   ├── icon.svg
│   ├── next.svg
│   ├── of-mice-and-men-image.jpg
│   ├── placeholder-book.png
│   ├── placeholder-user-image.png
│   ├── rebecca-image.jpg
│   ├── sharp-objects-image.jpg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── (shared sidebar)/
│   │   │   ├── book/
│   │   │   │   └── [bookId]/
│   │   │   │       ├── loading.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── library/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       ├── loading.tsx
│   │   │       └── page.tsx
│   │   ├── NotFound.tsx
│   │   ├── _components/
│   │   │   ├── book/
│   │   │   │   ├── BookPageView.tsx
│   │   │   │   ├── BookPageViewSkeleton.tsx
│   │   │   │   └── DangerAlertDialog.tsx
│   │   │   ├── library/
│   │   │   │   ├── EmptyLibrary.tsx
│   │   │   │   ├── GridView.tsx
│   │   │   │   ├── GridViewSkeleton.tsx
│   │   │   │   ├── ListView.tsx
│   │   │   │   ├── ListViewSkeleton.tsx
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   └── ToolbarSkeleton.tsx
│   │   │   ├── reader/
│   │   │   │   ├── EpubViewer.tsx
│   │   │   │   └── PdfViewer.tsx
│   │   │   ├── settings/
│   │   │   │   ├── SettingPageView.tsx
│   │   │   │   ├── SettingPageViewSkeleton.tsx
│   │   │   │   └── UploadProfilePictureModal.tsx
│   │   │   └── ui/
│   │   │       ├── Navbar.tsx
│   │   │       ├── NavbarSkeleton.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       ├── SidebarSkeleton.tsx
│   │   │       ├── UploadDocumentsModal.tsx
│   │   │       └── custom-select.tsx
│   │   ├── _db/
│   │   │   └── schema.ts
│   │   ├── _docs/
│   │   │   ├── changes or fixes or concepts/
│   │   │   │   ├── Data fetching for views.md
│   │   │   │   ├── Deletion of all books.md
│   │   │   │   ├── EPUB rendering.md
│   │   │   │   ├── Getting Epub cover image.md
│   │   │   │   ├── Getting started with drizzle.md
│   │   │   │   ├── How debounce works.md
│   │   │   │   ├── PDF rendering.md
│   │   │   │   ├── Problem with useLocalStorage hook.md
│   │   │   │   ├── Select layout shift fix.md
│   │   │   │   ├── Uploading files to supabase.md
│   │   │   │   └── shared layout.md
│   │   │   └── entire app/
│   │   │       ├── _components/
│   │   │       │   └── ui/
│   │   │       │       ├── UploadDocumentsModal.docs.md
│   │   │       │       └── custom-select.docs.md
│   │   │       ├── _lib/
│   │   │       │   └── hooks/
│   │   │       │       ├── useKeyPress.docs.md
│   │   │       │       ├── useLocalStorage.docs.md
│   │   │       │       └── useOnClickOutisde.docs.md
│   │   │       └── page.docs.md
│   │   ├── _lib/
│   │   │   ├── books.ts
│   │   │   ├── db.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useKeyPress.ts
│   │   │   │   ├── useLocalStorage.ts
│   │   │   │   ├── useOnClickOutisde.ts
│   │   │   │   └── useTheme.ts
│   │   │   ├── progress.ts
│   │   │   ├── supabase.ts
│   │   │   ├── types.ts
│   │   │   ├── userDetails.ts
│   │   │   └── utils.ts
│   │   ├── api/
│   │   │   ├── progress/
│   │   │   │   └── [bookId]/
│   │   │   │       └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   ├── error.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── reader/
│   │       └── [bookId]/
│   │           └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── native-select.tsx
│   │       ├── select.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       └── tooltip.tsx
│   └── lib/
│       └── utils.ts
└── tsconfig.json

```
