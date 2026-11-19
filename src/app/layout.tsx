import type { Metadata } from "next";
import Link from "next/link";
import { PROTOTYPE_DISCLAIMER } from "@/lib/labels";
import "./globals.css";

export const metadata: Metadata = {
  title: "repocoin",
  description: "Attach a token to a GitHub repo. A prototype: points only, not money.",
  robots: { index: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="text-lg tracking-tight text-fg no-underline">
              repocoin
            </Link>
            <span className="mark">Prototype</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">{children}</main>
        <footer className="border-t border-line">
          <p className="mx-auto max-w-5xl px-4 py-5 text-sm text-muted sm:px-6">{PROTOTYPE_DISCLAIMER}</p>
        </footer>
      </body>
    </html>
  );
}
