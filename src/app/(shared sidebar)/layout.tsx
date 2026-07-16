import Navbar from "@/app/_components/ui/Navbar";
import Sidebar from "@/app/_components/ui/Sidebar";

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <aside className="pt-18">
        <Sidebar />
      </aside>
      <main className="lg:pl-54">{children}</main>
    </>
  );
}
