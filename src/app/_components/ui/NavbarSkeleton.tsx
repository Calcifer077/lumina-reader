export default function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 flex justify-between items-center w-full h-18 px-4 bg-background border-b border-border z-50">
      {/* Logo placeholder */}
      <div className="h-5 w-32 rounded-md bg-surface-container-high animate-pulse" />

      <div className="flex space-x-4 items-center">
        {/* Search bar placeholder */}
        <div className="hidden lg:flex h-10 w-64 rounded-md bg-surface-container-high animate-pulse" />

        {/* Upload button placeholder */}
        <div className="h-10 w-10 lg:w-32 rounded-lg bg-surface-container-high animate-pulse" />

        {/* Theme toggle placeholder */}
        <div className="h-9 w-9 rounded-full bg-surface-container-high animate-pulse" />

        {/* Profile picture placeholder */}
        <div className="h-10 w-10 rounded-full bg-surface-container-high animate-pulse" />
      </div>
    </nav>
  );
}
