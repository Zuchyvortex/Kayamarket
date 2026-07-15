import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KayaMarket - Premium Foodstuff & Grocery Delivery in Nigeria",
  description: "Experience the convenience of premium online grocery shopping combined with the warmth of a traditional Nigerian market. Sourced directly from farmers, delivered fresh.",
  keywords: "grocery delivery, Lagos, Nigeria, foodstuff, fresh tomatoes, garri, yam, palm oil, online market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

