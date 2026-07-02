export default function ListViewSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-md">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_120px_100px_140px] items-center gap-4 pb-3 px-3 mb-2 border-b border-border">
        <span className="text-label-sm font-label uppercase tracking-wide text-muted-foreground">
          Book details
        </span>
        <span className="text-label-sm font-label uppercase tracking-wide text-muted-foreground">
          Format
        </span>
        <span className="text-label-sm font-label uppercase tracking-wide text-muted-foreground">
          File size
        </span>
        <span className="text-label-sm font-label uppercase tracking-wide text-muted-foreground">
          Last added
        </span>
      </div>

      {/* Skeleton rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_120px_100px_140px] items-center gap-4 py-3 px-3"
          >
            {/* Book details: cover, title, author */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-14 w-10 shrink-0 rounded-sm bg-accent animate-pulse" />
              <div className="flex flex-col gap-2 min-w-0 w-full">
                <div
                  className="h-3.5 rounded-sm bg-accent animate-pulse"
                  style={{ width: `${65 + (i % 3) * 10}%` }}
                />
                <div
                  className="h-3 rounded-sm bg-accent/70 animate-pulse"
                  style={{ width: `${35 + (i % 4) * 8}%` }}
                />
              </div>
            </div>

            {/* Format */}
            <div className="h-5 w-14 rounded-full bg-accent animate-pulse" />

            {/* File size */}
            <div className="h-3.5 w-12 rounded-sm bg-accent animate-pulse" />

            {/* Last added */}
            <div className="h-3.5 w-20 rounded-sm bg-accent animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
