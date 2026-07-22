import { Suspense } from "react";

import Navbar from "@/app/_components/ui/Navbar";
import NavbarSkeleton from "@/app/_components/ui/NavbarSkeleton";
import Sidebar from "@/app/_components/ui/Sidebar";
import SidebarSkeleton from "@/app/_components/ui/SidebarSkeleton";
import { getProfilePictureSignedUrl } from "@/app/_lib/userDetails";

export default async function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profilePicturePath = await getProfilePictureSignedUrl();

  return (
    <>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar profilePicturePath={profilePicturePath} />
      </Suspense>
      <aside className="pt-18">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
      </aside>
      <main className="lg:pl-54">{children}</main>
    </>
  );
}
