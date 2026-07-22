// app/_components/settings/SettingsPageViewSkeleton.tsx
export default function SettingPageViewSkeleton() {
  return (
    <div className="bg-background text-on-surface h-full px-4 py-8 sm:px-6 sm:py-10">
      <div className="animate-pulse">
        {/* Heading */}
        <div className="h-8 w-40 rounded-md bg-surface-container-high mb-2" />
        <div className="h-4 w-80 max-w-full rounded-full bg-surface-container-high mb-8" />

        {/* Profile card */}
        <div className="mb-8 bg-surface-container border border-outline-variant rounded-md p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {/* Profile Image */}
            <div className="flex justify-center md:justify-start relative">
              <div className="w-22 h-22 rounded-full bg-surface-container-high border-2 border-outline-variant" />
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-surface-container-high" />
            </div>

            {/* Form */}
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl justify-center items-center my-auto">
              <div className="h-10 w-full max-w-sm rounded-md bg-surface-container-high" />
              <div className="h-10 w-full max-w-sm rounded-md bg-surface-container-high" />
            </div>
          </div>
        </div>

        {/* Reading preference heading */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-[30px] h-[30px] rounded-md bg-surface-container-high" />
          <div className="h-5 w-44 rounded-md bg-surface-container-high" />
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-xl p-6 sm:p-8 shadow-sm space-y-8 mb-8">
          {/* Zoom Level */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="h-5 w-28 rounded-md bg-surface-container-high" />
              <div className="h-6 w-14 rounded-full bg-surface-container-high" />
            </div>

            <div className="flex items-center gap-4">
              <div className="h-9 w-9 shrink-0 rounded-md bg-surface-container-high" />
              <div className="h-2 flex-1 rounded-full bg-surface-container-high" />
              <div className="h-9 w-9 shrink-0 rounded-md bg-surface-container-high" />
            </div>
          </div>

          <div className="border-t border-outline-variant" />

          {/* EPUB Colors */}
          <div className="space-y-6">
            <div className="h-5 w-40 rounded-md bg-surface-container-high" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* Background */}
              <div className="lg:col-span-5">
                <div className="h-3 w-32 rounded-full bg-surface-container-high mb-2" />
                <div className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-high" />
              </div>

              {/* Text */}
              <div className="lg:col-span-5">
                <div className="h-3 w-24 rounded-full bg-surface-container-high mb-2" />
                <div className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-high" />
              </div>

              {/* Font Size */}
              <div className="lg:col-span-2">
                <div className="h-3 w-20 rounded-full bg-surface-container-high mb-2" />
                <div className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-high" />
              </div>
            </div>
          </div>
        </div>

        {/* Library management heading */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-[30px] h-[30px] rounded-md bg-surface-container-high" />
          <div className="h-5 w-48 rounded-md bg-surface-container-high" />
        </div>

        <div className="mb-8 rounded-xl border border-outline-variant bg-surface-container p-6 sm:p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Delete Books */}
            <div className="flex flex-col rounded-xl border border-outline-variant bg-surface p-6">
              <div className="h-5 w-36 rounded-md bg-surface-container-high mb-2" />
              <div className="h-3 w-full rounded-full bg-surface-container-high mb-1" />
              <div className="h-3 w-full rounded-full bg-surface-container-high mb-1" />
              <div className="h-3 w-2/3 rounded-full bg-surface-container-high mb-4" />
              <div className="mt-auto h-13 w-full rounded-md bg-surface-container-high" />
            </div>

            {/* Clear History */}
            <div className="flex flex-col rounded-xl border border-outline-variant bg-surface p-6">
              <div className="h-5 w-44 rounded-md bg-surface-container-high mb-2" />
              <div className="h-3 w-full rounded-full bg-surface-container-high mb-1" />
              <div className="h-3 w-3/4 rounded-full bg-surface-container-high mb-4" />
              <div className="mt-auto h-13 w-full rounded-md bg-surface-container-high" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
