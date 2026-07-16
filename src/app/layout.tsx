import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white text-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

