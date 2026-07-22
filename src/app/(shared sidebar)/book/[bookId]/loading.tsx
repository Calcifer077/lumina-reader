import BookPageViewSkeleton from "@/app/_components/book/BookPageViewSkeleton";

export default function Loading() {
  return (
    <div className="px-2 py-4 lg:px-6 lg:py-8 mb-12">
      <BookPageViewSkeleton />
    </div>
  );
}
