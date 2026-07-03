import { FaBookReader } from "react-icons/fa";
import { HiOutlineDocumentDuplicate, HiOutlineBookOpen } from "react-icons/hi2";
import { LuHistory, LuStar, LuArchive } from "react-icons/lu";
import { MdOutlinePictureAsPdf, MdOutlineSettings } from "react-icons/md";

const menuItems = [
  {
    name: "All Books",
    icon: <HiOutlineDocumentDuplicate className="h-5 w-5" />,
    visibleInMobileAndTablet: true,
  },
  {
    name: "Recent",
    icon: <LuHistory className="h-5 w-5" />,
    visibleInMobileAndTablet: true,
  },
  {
    name: "Favorites",
    icon: <LuStar className="h-5 w-5" />,
    visibleInMobileAndTablet: false,
  },
  {
    name: "PDF Documents",
    icon: <MdOutlinePictureAsPdf className="h-5 w-5" />,
    visibleInMobileAndTablet: false,
  },
  {
    name: "EPUB Files",
    icon: <HiOutlineBookOpen className="h-5 w-5" />,
    visibleInMobileAndTablet: false,
  },
];

const bottomLeftMenuItems = [
  {
    name: "Archived",
    icon: <LuArchive className="h-5 w-5" />,
    visibleInMobileAndTablet: false,
  },
  {
    name: "Settings",
    icon: <MdOutlineSettings className="h-5 w-5" />,
    visibleInMobileAndTablet: true,
  },
];

export default function Sidebar() {
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
        {[...menuItems, ...bottomLeftMenuItems]
          .filter((item) => item.visibleInMobileAndTablet)
          .map((item) => (
            <button
              key={item.name}
              className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
            >
              {item.icon}
              <span className="text-[10px]">{item.name}</span>
            </button>
          ))}
      </div>

      {/* ================= Desktop ================= */}
      <div className="hidden h-full flex-col lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3">
          <FaBookReader className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">My Library</h1>
        </div>

        {/* Main Menu */}
        <nav className="mt-8 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/30"
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Menu */}
        <nav className="mt-auto space-y-1 border-t border-border pt-4">
          {bottomLeftMenuItems.map((item) => (
            <button
              key={item.name}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/30"
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
