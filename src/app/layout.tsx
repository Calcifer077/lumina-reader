// app/layout.tsx
import type { Metadata } from "next";
import { Literata, Outfit, Plus_Jakarta_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import "./globals.css";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('darkMode');
                  if (saved === 'true') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
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
        <main>
          <TooltipProvider>{children}</TooltipProvider>
        </main>
        <Toaster
          richColors
          toastOptions={{
            classNames: {
              toast:
                "bg-surface-container text-on-surface border-outline-variant font-body",
              warning:
                "bg-secondary-container text-on-secondary-container border-secondary",
              error: "bg-error-container text-on-error-container border-error",
              success:
                "bg-tertiary-container text-on-tertiary-container border-tertiary",
              info: "bg-primary-container text-on-primary-container border-primary",
              description: "text-on-surface-variant",
              actionButton: "bg-primary text-primary-foreground",
              cancelButton: "bg-surface-high text-on-surface-variant",
            },
          }}
        />
      </body>
    </html>
  );
}
