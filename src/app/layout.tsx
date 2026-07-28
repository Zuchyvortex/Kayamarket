import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "KayaMarket - Fresh Foodstuffs & Express Delivery",
  description: "Experience the convenience of fresh, farm-sourced foodstuffs and reliable express delivery.",
  keywords: "KayaMarket, foodstuff delivery, fresh groceries, garri, rice, palm oil, express delivery",
  icons: {
    icon: [
      { url: "/k-5.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" }
    ],
    shortcut: "/k-5.png",
    apple: "/k-5.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
