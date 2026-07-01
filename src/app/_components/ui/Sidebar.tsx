import { FaBookReader } from "react-icons/fa";
import { HiOutlineDocumentDuplicate, HiOutlineBookOpen } from "react-icons/hi2";
import { LuHistory, LuStar, LuArchive } from "react-icons/lu";
import { MdOutlinePictureAsPdf, MdOutlineSettings } from "react-icons/md";

const menuItems = [
  {
    name: "All Books",
    icon: <HiOutlineDocumentDuplicate className="h-5 w-5" />,
  },
  {
    name: "Recent",
    icon: <LuHistory className="h-5 w-5" />,
  },
  {
    name: "Favorites",
    icon: <LuStar className="h-5 w-5" />,
  },
  {
    name: "PDF Documents",
    icon: <MdOutlinePictureAsPdf className="h-5 w-5" />,
  },
  {
    name: "EPUB Files",
    icon: <HiOutlineBookOpen className="h-5 w-5" />,
  },
];

const bottomLeftMenuItems = [
  {
    name: "Archived",
    icon: <LuArchive className="h-5 w-5" />,
  },
  {
    name: "Settings",
    icon: <MdOutlineSettings className="h-5 w-5" />,
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-18 left-0 w-54 h-[calc(100vh-4.5rem)] border-r border-border bg-background flex flex-col px-3 py-5">
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
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/30 "
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
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/30"
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
