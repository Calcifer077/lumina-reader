const placeholders = Array.from({ length: 8 });

export default function GridViewSkeleton() {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse"
      role="status"
      aria-label="Loading books"
    >
      {placeholders.map((_, index) => (
        <div key={index} className="mb-6 w-full">
          <div className="aspect-4/5 w-full bg-gray-200 rounded-xl" />
          <div className="h-6 w-full bg-gray-200 mt-2 rounded-md" />
          <div className="h-4 w-3/4 bg-gray-200 mt-2 rounded-md" />
        </div>
      ))}
    </div>
  );
}
