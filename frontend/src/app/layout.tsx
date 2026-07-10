import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { CategorySidebar } from "@/components/category-sidebar";
import { ChatWidget } from "@/components/chat-widget";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ElectroGadget — Premium Electronics",
    template: "%s | ElectroGadget",
  },
  description:
    "ElectroGadget is a premium electronics storefront — thoughtfully curated audio, wearables, and accessories.",
  openGraph: {
    title: "ElectroGadget — Premium Electronics",
    description:
      "ElectroGadget is a premium electronics storefront — thoughtfully curated audio, wearables, and accessories.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg-primary">
        <div className="flex flex-1 items-stretch">
          <CategorySidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main className="min-w-0 flex-1 lg:pr-6 lg:pl-6">{children}</main>
            <Footer />
          </div>
        </div>
        <ChatWidget />
      </body>
    </html>
  );
}
