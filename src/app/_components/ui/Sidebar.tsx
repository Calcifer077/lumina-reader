"use client";

import { FaBookReader } from "react-icons/fa";
import { HiOutlineDocumentDuplicate, HiOutlineBookOpen } from "react-icons/hi2";
import { LuHistory } from "react-icons/lu";
import { MdOutlinePictureAsPdf, MdOutlineSettings } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const menuItems = [
  {
    name: "All Books",
    icon: <HiOutlineDocumentDuplicate className="h-5 w-5" />,
    visibleInMobileAndTablet: true,
    href: "/library",
    value: "",
  },
  {
    name: "Recent",
    icon: <LuHistory className="h-5 w-5" />,
    visibleInMobileAndTablet: false,
    value: "recently_opened",
  },
  {
    name: "PDF Documents",
    icon: <MdOutlinePictureAsPdf className="h-5 w-5" />,
    visibleInMobileAndTablet: false,
    value: "pdf",
  },
  {
    name: "EPUB Files",
    icon: <HiOutlineBookOpen className="h-5 w-5" />,
    visibleInMobileAndTablet: false,
    value: "epub",
  },
];

const bottomLeftMenuItems = [
  {
    name: "Settings",
    icon: <MdOutlineSettings className="h-5 w-5" />,
    visibleInMobileAndTablet: true,
    href: "settings",
    value: "settings",
  },
];

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const value = searchParams.get("sort") || "";

  function changeValue(newValue: string) {
    const params = new URLSearchParams(searchParams);
    params.set("sort", newValue);

    router.push(`?${params.toString()}`);
  }

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
          .map((item) => {
            const isActive = item.value === value;

            const className = `flex flex-col items-center gap-1 transition-colors ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            }`;

            const content = (
              <>
                {item.icon}
                <span className="text-[10px]">{item.name}</span>
              </>
            );

            return item.href ? (
              <Link key={item.name} href={item.href} className={className}>
                {content}
              </Link>
            ) : (
              <button
                key={item.name}
                className={className}
                onClick={() => changeValue(item.value)}
              >
                {content}
              </button>
            );
          })}
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
          {menuItems.map((item) => {
            const isActive = item.value === value;

            const className = `flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/30 text-on-primary"
                : "text-muted-foreground hover:bg-primary/10"
            }`;

            const content = (
              <>
                {item.icon}
                <span className="text-[12px]">{item.name}</span>
              </>
            );

            return item.href ? (
              <Link key={item.name} href={item.href} className={className}>
                {content}
              </Link>
            ) : (
              <button
                key={item.name}
                className={className}
                onClick={() => changeValue(item.value)}
              >
                {content}
              </button>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <nav className="mt-auto space-y-1 border-t border-border pt-4">
          {bottomLeftMenuItems.map((item) => (
            <Link href={item.href} key={item.name}>
              <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/30">
                {item.icon}
                <span className="text-[14px]">{item.name}</span>
              </button>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
