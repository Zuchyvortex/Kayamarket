"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, FolderTree, AlertTriangle, ClipboardList, Truck, BarChart3, LogOut, ArrowLeft, ShieldAlert, Menu, X } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      setChecking(false);
    }
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-white text-[#111111] flex items-center justify-center font-sans">
        <p className="text-sm font-bold animate-pulse text-kaya-orange">Verifying Admin Credentials...</p>
      </div>
    );
  }

  // Access denied panel if not logged in as Admin
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6">
          <div className="bg-rose-50 text-rose-600 p-4 rounded-3xl w-fit mx-auto border border-rose-100">
            <ShieldAlert className="h-10 w-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-[#111111] tracking-tight">Admin Area Access Denied</h1>
            <p className="text-xs text-slate-550 leading-relaxed">
              This area is restricted to KayaMarket Administrators. Standard customers cannot view these analytics and management tools.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Administrator Sign In</p>
            <button 
              onClick={() => router.push("/login?callbackUrl=/admin")}
              className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md focus:outline-none"
            >
              Sign In with Admin Account
            </button>
          </div>

          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-kaya-orange font-bold hover:text-orange-600">
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
    <div className="min-h-screen bg-slate-50 text-[#111111] flex font-sans">
      
      {/* Sidebar Panel - Redesigned to be clean and light */}
      <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Brand Logo */}
          <Link href="/admin" className="flex items-center space-x-2 px-2 py-2">
            <img 
              src="/k-1.png" 
              alt="Kaya Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-[10px] bg-slate-900 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Admin</span>
          </Link>

          {/* Links list */}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={`w-full flex items-center space-x-3 px-4.5 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                    active 
                      ? "bg-slate-900 text-white shadow-md" 
                      : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <link.icon className={`h-4.5 w-4.5 ${active ? "text-kaya-orange" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer options */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <Link href="/" className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            <span>Public Store</span>
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Box */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header bar - White, clean border */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex justify-between items-center shrink-0">
          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2.5 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 md:hidden transition-all focus:outline-none"
            title="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
            KayaMarket Management Console
          </h2>
          
          <div className="flex items-center space-x-4 ml-auto">
            <div className="text-right">
              <p className="text-xs font-bold text-[#111111]">{user.name}</p>
              <p className="text-[10px] text-kaya-orange font-bold uppercase tracking-wider">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-kaya-orange uppercase">
              {user.name.slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>

          {/* Drawer container */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Close button */}
            <div className="flex justify-between items-center pb-6 border-b border-slate-100 mb-6">
              <Link href="/admin" className="flex items-center space-x-2" onClick={() => setMobileSidebarOpen(false)}>
                <img 
                  src="/k-1.png" 
                  alt="Kaya Logo" 
                  className="h-8 w-auto object-contain"
                />
                <span className="text-[10px] bg-slate-900 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>
              </Link>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links list */}
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {sidebarLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link 
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`w-full flex items-center space-x-3 px-4.5 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                      active 
                        ? "bg-slate-900 text-white shadow-md" 
                        : "text-slate-655 hover:bg-slate-50"
                    }`}
                  >
                    <link.icon className={`h-4.5 w-4.5 ${active ? "text-kaya-orange" : "text-slate-400"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer options */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <Link href="/" className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-605 hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4" />
                <span>Public Store</span>
              </Link>
              <button 
                onClick={() => {
                  setMobileSidebarOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left focus:outline-none"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
