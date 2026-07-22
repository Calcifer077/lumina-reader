export default function BookPageViewSkeleton() {
  return (
    <div className="h-full bg-background text-foreground font-sans px-6 py-8">
      <div className="max-w-5xl mx-auto animate-pulse">
        {/* Breadcrumb */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-4 w-32 rounded-full bg-surface-container-high" />
          <div className="h-4 w-24 rounded-full bg-surface-container-high" />
        </div>

        {/* Heading */}
        <div className="h-8 w-64 rounded-md bg-surface-container-high mb-3" />
        <div className="h-4 w-full max-w-md rounded-full bg-surface-container-high mb-1" />
        <div className="h-4 w-3/4 max-w-sm rounded-full bg-surface-container-high mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          {/* Cover column */}
          <div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex items-center justify-center">
              <div className="w-full aspect-2/3 rounded-md bg-surface-container-high" />
            </div>

            <div className="flex flex-col mt-2">
              <div className="h-14 md:h-10 w-full rounded-md bg-surface-container-high mt-4" />
              <div className="flex mt-4 gap-4 justify-between">
                <div className="h-3 w-20 rounded-full bg-surface-container-high" />
                <div className="h-3 w-16 rounded-full bg-surface-container-high" />
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
              <div className="h-6 w-48 rounded-md bg-surface-container-high mb-3" />
              <div className="h-px bg-outline-variant mb-6" />

              <div className="space-y-5">
                <div>
                  <div className="h-3 w-24 rounded-full bg-surface-container-high mb-2" />
                  <div className="h-11 w-full rounded-md bg-surface-container-low border border-outline-variant" />
                </div>

                <div>
                  <div className="h-3 w-16 rounded-full bg-surface-container-high mb-2" />
                  <div className="h-11 w-full rounded-md bg-surface-container-low border border-outline-variant" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-6 mt-8">
                <div className="h-4 w-16 rounded-full bg-surface-container-high" />
                <div className="h-11 w-32 rounded-md bg-surface-container-high" />
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-error-container/10 border border-error-container rounded-xl p-6">
              <div className="h-6 w-56 rounded-md bg-surface-container-high mb-4" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="w-full max-w-xs">
                  <div className="h-4 w-32 rounded-full bg-surface-container-high mb-2" />
                  <div className="h-3 w-full rounded-full bg-surface-container-high mb-1" />
                  <div className="h-3 w-2/3 rounded-full bg-surface-container-high" />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="h-10 w-36 rounded-md bg-surface-container-high" />
                  <div className="h-10 w-28 rounded-md bg-surface-container-high" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
