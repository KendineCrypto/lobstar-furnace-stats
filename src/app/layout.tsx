// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.
import type { Metadata } from "next";
import "./globals.css";
import FurnaceHeader from "@/components/FurnaceHeader";
import FurnaceFooter from "@/components/FurnaceFooter";

export const metadata: Metadata = {
  title: "☿ The Furnace — Unofficial Stats",
  description:
    "The vessel responds according to laws you are not meant to see plainly. Unofficial stats dashboard for the Lobstar furnace.",
  openGraph: {
    title: "☿ The Furnace Stats",
    description: "Unofficial sacrifice statistics for the Lobstar furnace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-furnace-white antialiased">
        <FurnaceHeader />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        <FurnaceFooter />
      </body>
    </html>
  );
}
