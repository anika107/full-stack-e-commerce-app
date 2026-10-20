import type { Metadata } from "next";
import { Geist_Mono, Inter, Fraunces } from "next/font/google";
import "./globals.css";

// Body: Inter. Display headings (storefront): Fraunces. Mono: Geist (admin).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "ShopPilot", template: "%s · ShopPilot" },
  description: "A modern e-commerce store built with Next.js.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
