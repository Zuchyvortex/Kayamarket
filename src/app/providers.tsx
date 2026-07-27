"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/context/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

