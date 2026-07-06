import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Header } from "@/components/header/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Electrogadget — Premium Electronics",
  description: "Premium electronics, curated for the modern home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AnnouncementBar />

        <Header />

        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
