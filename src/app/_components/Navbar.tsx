import Image from "next/image";
import { IoMdCloudUpload } from "react-icons/io";
import { MdOutlineSettings } from "react-icons/md";
import { CiSearch } from "react-icons/ci";

import { Input } from "@/components/ui/input";

export default function Navbar() {
  return (
    <nav className="fixed top-0 flex justify-between items-center w-full h-18 px-4 bg-background border-b border-border z-50">
      <div className="font-extrabold uppercase text-primary tracking-normal text-xl">
        Lumina Reader
      </div>

      <div className="flex space-x-4 items-center">
        <div className="relative">
          <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input placeholder="Search your library..." className="pl-10 h-10" />
        </div>
        <div className="flex items-center gap-2 cursor-pointer border p-2 px-6 rounded-lg bg-primary text-primary-foreground">
          <div>
            <IoMdCloudUpload />
          </div>
          <div className="tracking-wide">Upload Book</div>
        </div>
        <div className="flex items-center space-x-1">
          <MdOutlineSettings className="w-8 h-8" />
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-primary">
          <Image src="/115633814.jpg" alt="Profile" width={40} height={40} />
        </div>
      </div>
    </nav>
  );
}
