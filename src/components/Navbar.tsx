"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Leaf, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-green-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="relative h-10 w-10 overflow-hidden transition-transform group-hover:scale-105 duration-300">
              <img src="/K.png" alt="KayaMarket Logo" className="object-contain w-full h-full" />
            </div>
            <span className="text-2xl font-black text-kaya-black tracking-tight group-hover:text-kaya-orange transition-colors">KayaMarket</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg px-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="What are you looking for today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50/30 text-slate-700 placeholder-green-700/50 transition-all shadow-inner text-sm"
              />
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-green-600/70" />
            </div>
          </form>

          {/* Right menu */}
          <div className="flex items-center space-x-6">
            <Link href="/products" className="text-slate-600 hover:text-green-700 font-medium transition-colors text-sm hidden sm:block">
              Browse Shop
            </Link>

            {/* Auth section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1 text-slate-700 hover:text-kaya-orange font-semibold text-sm transition-colors focus:outline-none"
                >
                  <span className="max-w-[100px] truncate">Hello, {user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                    </div>
                    {user.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-kaya-orange transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-kaya-orange transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>My Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-kaya-green font-bold hover:text-kaya-green-hover transition-colors text-sm"
              >
                Sign In
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative bg-gradient-to-r from-kaya-orange to-orange-400 text-white p-3 rounded-full shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-kaya-green text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
