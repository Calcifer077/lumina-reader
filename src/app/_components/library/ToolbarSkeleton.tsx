export default function ToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between animate-pulse">
      {/* Heading */}
      <div className="w-full md:w-auto">
        <div className="h-8 w-40 rounded-md bg-muted" />
        <div className="mt-2 h-4 w-52 rounded-md bg-muted" />
      </div>

      {/* Controls */}
      <div className="flex w-full items-center gap-3 md:w-auto md:justify-end">
        {/* Grid/List Toggle */}
        <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
          <div className="h-10 w-10 rounded-md bg-muted" />
          <div className="ml-1 h-10 w-10 rounded-md bg-muted" />
        </div>

        {/* Sort Select */}
        <div className="h-10 flex-1 rounded-md bg-muted md:w-44 md:flex-none" />
      </div>
    </div>
  );
}
