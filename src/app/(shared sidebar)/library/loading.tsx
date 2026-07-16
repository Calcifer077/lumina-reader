import GridViewSkeleton from "@/app/_components/library/GridViewSkeleton";
import ToolbarSkeleton from "@/app/_components/library/ToolbarSkeleton";

export default function loading() {
  return (
    <div className="px-2 py-4 lg:px-6 lg:py-8 mb-12">
      <ToolbarSkeleton />
      <div className="mt-6 p-4">
        <GridViewSkeleton />
      </div>
    </div>
  );
}
