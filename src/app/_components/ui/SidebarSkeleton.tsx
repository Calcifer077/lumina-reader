export default function SidebarSkeleton() {
  return (
    <aside
      className="
        fixed z-50 bg-background

        bottom-0 left-0 right-0
        h-16 border-t border-border

        lg:top-18 lg:left-0 lg:bottom-auto lg:right-auto
        lg:h-[calc(100vh-4.5rem)]
        lg:w-54
        lg:border-t-0 lg:border-r
        lg:px-3 lg:py-5
      "
    >
      {/* ================= Mobile / Tablet ================= */}
      <div className="flex h-full items-center justify-around lg:hidden">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-5 w-5 rounded bg-surface-container-high animate-pulse" />
            <div className="h-2 w-8 rounded bg-surface-container-high animate-pulse" />
          </div>
        ))}
      </div>

      {/* ================= Desktop ================= */}
      <div className="hidden h-full flex-col lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3">
          <div className="h-6 w-6 rounded bg-surface-container-high animate-pulse" />
          <div className="h-5 w-24 rounded bg-surface-container-high animate-pulse" />
        </div>

        {/* Main Menu */}
        <nav className="mt-8 space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5"
            >
              <div className="h-5 w-5 rounded bg-surface-container-high animate-pulse" />
              <div className="h-3 w-20 rounded bg-surface-container-high animate-pulse" />
            </div>
          ))}
        </nav>

        {/* Bottom Menu */}
        <nav className="mt-auto space-y-1 border-t border-border pt-4">
          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2.5">
            <div className="h-5 w-5 rounded bg-surface-container-high animate-pulse" />
            <div className="h-3 w-16 rounded bg-surface-container-high animate-pulse" />
          </div>
        </nav>
      </div>
    </aside>
  );
}
