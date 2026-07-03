export default function ListViewSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-md">
      {/* Desktop Header */}
      <div className="hidden md:grid grid-cols-[1fr_120px_100px_140px] items-center gap-4 border-b border-border pb-3 px-3 mb-2">
        <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
          Book details
        </span>
        <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
          Format
        </span>
        <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
          File size
        </span>
        <span className="text-label-sm uppercase tracking-wide text-muted-foreground">
          Last added
        </span>
      </div>

      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="
              flex flex-col gap-3 py-4 px-3

              md:grid md:grid-cols-[1fr_120px_100px_140px]
              md:items-center md:gap-4
            "
          >
            {/* Book */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-16 w-12 shrink-0 rounded-sm bg-accent animate-pulse" />

              <div className="flex flex-col gap-2 flex-1">
                <div
                  className="h-4 rounded bg-accent animate-pulse"
                  style={{ width: `${65 + (i % 3) * 10}%` }}
                />
                <div
                  className="h-3 rounded bg-accent/70 animate-pulse"
                  style={{ width: `${35 + (i % 4) * 8}%` }}
                />
              </div>
            </div>

            {/* Mobile metadata */}
            <div className="flex items-center gap-3 md:hidden">
              <div className="h-6 w-14 rounded-full bg-accent animate-pulse" />
              <div className="h-3.5 w-12 rounded bg-accent animate-pulse" />
              <div className="h-3.5 w-20 rounded bg-accent animate-pulse" />
            </div>

            {/* Desktop columns */}
            <div className="hidden md:block h-5 w-14 rounded-full bg-accent animate-pulse" />
            <div className="hidden md:block h-3.5 w-12 rounded bg-accent animate-pulse" />
            <div className="hidden md:block h-3.5 w-20 rounded bg-accent animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
