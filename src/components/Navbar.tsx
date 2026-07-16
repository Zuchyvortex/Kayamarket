"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  User, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown, 
  Heart, 
  History, 
  Bell, 
  Tag, 
  Grid,
  Menu,
  X
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CATEGORIES } from "@/lib/mockData";

export default function Navbar() {
  const { cartCount, wishlist } = useCart();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const notifications = [
    { id: 1, text: "🎉 Get 10% off your first stew combo basket!", time: "2 hours ago" },
    { id: 2, text: "🍅 Fresh harvest of Roma tomatoes just arrived.", time: "5 hours ago" }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 w-full ${
      scrolled 
        ? "h-20 bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100" 
        : "h-24 bg-white border-b border-slate-50"
    }`}>
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full gap-4">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center shrink-0 group relative py-2">
            <div className="relative transition-all duration-300 transform group-hover:scale-[1.02] flex items-center justify-center">
              <img 
                src="/k-1.png" 
                alt="KayaMarket Logo" 
                className={`object-contain transition-all duration-300 ${
                  scrolled ? "h-12 md:h-13" : "h-16 md:h-18"
                }`}
              />
            </div>
          </Link>

          {/* Search bar - premium rounded styling */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:block relative group">
            <div className="relative">
              <input
                type="text"
                placeholder="What are you looking for today?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange bg-slate-50 text-slate-850 placeholder-slate-400 transition-all shadow-inner text-sm font-semibold"
              />
              <Search className="absolute left-4 top-4 h-4.5 w-4.5 text-slate-400 group-focus-within:text-kaya-orange transition-colors" />
              <button 
                type="submit" 
                className="absolute right-2.5 top-2 bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-md hover:shadow-orange-500/20 focus:outline-none"
              >
                Search
              </button>
            </div>
          </form>

          {/* Navigation Links & Action Controls */}
          <div className="flex items-center space-x-1 lg:space-x-4">
            
            {/* Categories Menu */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all focus:outline-none"
              >
                <Grid className="h-4 w-4 text-kaya-orange" />
                <span>Categories</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${catDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {catDropdownOpen && (
                <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 mb-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Store Categories</p>
                  </div>
                  {CATEGORIES.slice(0, 8).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setCatDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm font-semibold text-slate-750 hover:bg-orange-50 hover:text-kaya-orange transition-colors"
                    >
                      <img src={cat.image} className="w-6 h-6 rounded-lg object-cover" alt="" />
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                  <div className="border-t border-slate-50 mt-2 pt-2 px-4">
                    <Link href="/products" onClick={() => setCatDropdownOpen(false)} className="text-xs font-bold text-kaya-orange hover:text-orange-600 transition-colors flex items-center space-x-1">
                      <span>View All Categories</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Deals link */}
            <Link 
              href="/products?featured=true" 
              className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all group"
            >
              <Tag className="h-4 w-4 text-kaya-orange group-hover:animate-pulse" />
              <span>Deals</span>
            </Link>

            {/* Orders log */}
            {user && (
              <Link 
                href="/dashboard" 
                className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
              >
                <History className="h-4 w-4 text-kaya-orange" />
                <span>Orders</span>
              </Link>
            )}

            {/* Wishlist Link */}
            <Link 
              href="/dashboard?tab=wishlist" 
              className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-655 hover:text-rose-500 transition-all group"
              title="My Wishlist"
            >
              <Heart className="h-5 w-5 transition-transform group-hover:scale-110" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-655 hover:text-kaya-orange transition-all focus:outline-none"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 bg-kaya-orange h-2 w-2 rounded-full ring-2 ring-white"></span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 mb-2 flex justify-between items-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Alerts</p>
                    <button onClick={() => setNotifOpen(false)} className="text-[10px] text-kaya-orange font-bold focus:outline-none">Close</button>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-55 last:border-b-0 transition-colors">
                      <p className="text-xs font-semibold text-slate-700">{n.text}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-bold text-sm transition-all focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-kaya-orange to-orange-400 text-white flex items-center justify-center text-xs uppercase shadow-sm">
                    {user.name.slice(0, 2)}
                  </div>
                  <span className="max-w-[80px] truncate hidden sm:block">Hello, {user.name.split(" ")[0]}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-bold text-slate-850 truncate">{user.email}</p>
                    </div>
                    {user.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-kaya-orange transition-colors"
                      >
                        <LayoutDashboard className="h-4.5 w-4.5 text-kaya-orange" />
                        <span>Admin Console</span>
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-kaya-orange transition-colors"
                      >
                        <User className="h-4.5 w-4.5 text-kaya-orange" />
                        <span>My Account</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50/50 transition-colors text-left focus:outline-none"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-kaya-orange hover:text-orange-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative bg-gradient-to-r from-kaya-orange to-orange-500 text-white p-3 rounded-full shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full h-5.5 w-5.5 flex items-center justify-center border-2 border-white shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-655 hover:bg-slate-100 md:hidden transition-all focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-slate-100 p-6 space-y-6 md:hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              placeholder="Search tomatoes, yam, rice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none"
            />
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          </form>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link 
              href="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-3 bg-slate-50 rounded-2xl font-bold text-xs"
            >
              <Grid className="h-4 w-4 text-kaya-orange" />
              <span>Browse Shop</span>
            </Link>
            <Link 
              href="/products?featured=true" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-3 bg-slate-50 rounded-2xl font-bold text-xs"
            >
              <Tag className="h-4 w-4 text-kaya-orange" />
              <span>Hot Deals</span>
            </Link>
            {user && (
              <Link 
                href="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 p-3 bg-slate-50 rounded-2xl font-bold text-xs"
              >
                <History className="h-4 w-4 text-kaya-orange" />
                <span>My Orders</span>
              </Link>
            )}
            <Link 
              href="/dashboard?tab=wishlist" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 p-3 bg-slate-50 rounded-2xl font-bold text-xs"
            >
              <Heart className="h-4 w-4 text-rose-500" />
              <span>Wishlist</span>
            </Link>
          </div>
          
          <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full bg-slate-100 hover:bg-rose-50 hover:text-rose-550 p-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center space-x-2 focus:outline-none"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out ({user.name.split(" ")[0]})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-kaya-orange text-white p-3 rounded-2xl font-bold text-xs text-center block"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
