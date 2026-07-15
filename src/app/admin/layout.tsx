"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, FolderTree, AlertTriangle, ClipboardList, Truck, BarChart3, LogOut, ArrowLeft, Leaf, ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "ADMIN") {
        setChecking(false);
      } else {
        setChecking(false);
      }
    }
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
        <p className="text-sm font-bold animate-pulse text-green-400">Verifying Admin Credentials...</p>
      </div>
    );
  }

  // Access denied panel if not logged in as Admin
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6">
          <div className="bg-rose-500/10 text-rose-500 p-4 rounded-3xl w-fit mx-auto border border-rose-500/20">
            <ShieldAlert className="h-10 w-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-white tracking-tight">Admin Area Access Denied</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              This area is restricted to KayaMarket Administrators. Standard customers cannot view these analytics and management tools.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Administrator Sign In</p>
            <button 
              onClick={() => router.push("/login?callbackUrl=/admin")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Sign In with Admin Account
            </button>
          </div>

          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-green-500 font-bold hover:text-green-400">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products Manager", icon: ShoppingBag },
    { href: "/admin/categories", label: "Category Manager", icon: FolderTree },
    { href: "/admin/inventory", label: "Inventory & Alerts", icon: AlertTriangle },
    { href: "/admin/orders", label: "Orders Board", icon: ClipboardList },
    { href: "/admin/delivery", label: "Riders & Dispatch", icon: Truck },
    { href: "/admin/analytics", label: "Sales Analytics", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* Sidebar Panel */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 hidden md:flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2 text-white px-2">
            <Leaf className="h-6 w-6 text-green-500" />
            <span className="text-lg font-black tracking-tight">Kaya Admin</span>
          </div>

          {/* Links list */}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    active 
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/10" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <link.icon className="h-4.5 w-4.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer options */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>Public Store</span>
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-950/30 text-left focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Box */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header bar */}
        <header className="h-20 bg-slate-900 border-b border-slate-800 px-6 sm:px-8 flex justify-between items-center shrink-0">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
            KayaMarket Management Console
          </h2>
          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-right">
              <p className="text-xs font-bold text-white">{user.name}</p>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-green-400 uppercase">
              {user.name.slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
