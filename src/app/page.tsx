import { Suspense } from "react";

import GridViewSkeleton from "@/app/_components/home/GridViewSkeleton";
import GridView from "@/app/_components/home/GridView";
import Toolbar from "@/app/_components/home/Toolbar";

import { Book } from "@/app/_lib/types";

const fakeBookData: Book[] = [
  {
    title: "Sharp Objects",
    author: "Gillian Flynn",
    image: "/sharp-objects-image.jpg",
    type: "pdf",
    progress: 0.5, // 50% progress
  },
  {
    title: "Of Mice and Men",
    author: "John Steinbeck",
    image: "/of-mice-and-men-image.jpg",
    type: "pdf",
    progress: 0.1,
  },
  {
    title: "Fake Book 3",
    author: "Fake Author 3",
    image: "/of-mice-and-men-image.jpg",
    type: "pdf",
    progress: 0.9,
  },
  {
    title: "Fake Book 4",
    author: "Fake Author 4",
    image: "/of-mice-and-men-image.jpg",
    type: "epub",
    progress: 0,
  },
  {
    title: "Fake Book 5",
    author: "Fake Author 5",
    image: "/of-mice-and-men-image.jpg",
    type: "epub",
    progress: 0,
  },
  {
    title: "Fake Book 6",
    author: "Fake Author 6",
    image: "/of-mice-and-men-image.jpg",
    type: "pdf",
    progress: 0,
  },
  {
    title: "Fake Book 7",
    author: "Fake Author 7",
    image: "/rebecca-image.jpg",
    type: "pdf",
    progress: 0,
  },
  {
    title: "Fake Book 8",
    author: "Fake Author 8",
    // author:
    // "The Heart of the Buddha's Teaching: Transforming Suffering into Peace, Joy, and Liberation",
    image: "/rebecca-image.jpg",
    type: "pdf",
    progress: 0,
  },
];

export default function Home() {
  return (
    <div className="px-6 py-8">
      <Toolbar />
      {/* ALL THE BOOKS */}
      <div className="mt-8 border rounded-md p-4">
        <Suspense fallback={<GridViewSkeleton />}>
          <GridView books={fakeBookData} />
        </Suspense>
      </div>
    </div>
  );
}
