import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/header";
import { CategorySidebar } from "@/components/category-sidebar";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Electromart — Premium Electronics",
    template: "%s | Electromart",
  },
  description:
    "Electromart is a premium electronics storefront — thoughtfully curated audio, wearables, and accessories.",
  openGraph: {
    title: "Electromart — Premium Electronics",
    description:
      "Electromart is a premium electronics storefront — thoughtfully curated audio, wearables, and accessories.",
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
        <div className="flex flex-1 items-start">
          <CategorySidebar />

          <div className="flex min-w-0 flex-1 flex-col py-5 ">
            <Header />
            <main className="min-w-0 flex-1 lg:pl-6">{children}</main>
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
