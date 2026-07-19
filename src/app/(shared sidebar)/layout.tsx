import Navbar from "@/app/_components/ui/Navbar";
import Sidebar from "@/app/_components/ui/Sidebar";
import { getProfilePictureSignedUrl } from "@/app/_lib/userDetails";

export default async function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profilePicturePath = await getProfilePictureSignedUrl();

  return (
    <>
      <Navbar profilePicturePath={profilePicturePath} />
      <aside className="pt-18">
        <Sidebar />
      </aside>
      <main className="lg:pl-54">{children}</main>
    </>
  );
}
