import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "KayaMarket - Fresh Foodstuffs & Express Delivery in Nigeria",
  description: "Experience the convenience of fresh, farm-sourced foodstuffs and reliable express delivery across Nigeria.",
  keywords: "KayaMarket, foodstuff delivery, Lagos, Nigeria, fresh groceries, garri, rice, palm oil, express delivery",
  icons: {
    icon: "/K.png",
    shortcut: "/K.png",
    apple: "/K.png"
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
