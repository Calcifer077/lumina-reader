// app/layout.tsx
import type { Metadata } from "next";
import { Literata, Plus_Jakarta_Sans, Outfit } from "next/font/google";

import "./globals.css";

import Navbar from "@/app/_components/Navbar";
import Sidebar from "@/app/_components/Sidebar";
import { cn } from "@/lib/utils";

// Outfit is the perfect lookalike for Google Sans / Product Sans
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// Plus Jakarta Sans is wonderfully soft, perfect for modern UI body text
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

// Google's official e-reader serif font
const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumina",
  description: "Personal Ebook Reader",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", outfit.variable)} // Set Outfit as default font-sans base
    >
      <body
        className={`
          ${outfit.variable}
          ${jakarta.variable}
          ${literata.variable}
          min-h-screen
          bg-background
          text-primary
          antialiased
        `}
      >
        <Navbar />
        <aside className="pt-18">
          <Sidebar />
        </aside>
        <main className="pt-32">{children}</main>
      </body>
    </html>
  );
}
