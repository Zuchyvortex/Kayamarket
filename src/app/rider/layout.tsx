"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Truck, LogOut, Sun, Moon, MapPin, PackageCheck, ShieldAlert, Navigation } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import NotificationDropdown from "@/components/NotificationDropdown";

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [riderSession, setRiderSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedRider = localStorage.getItem("kayamarket_rider_session");
    if (savedRider) {
      try {
        setRiderSession(JSON.parse(savedRider));
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("kayamarket_rider_session");
    setRiderSession(null);
    router.push("/rider/login");
  };

  if (pathname === "/rider/login") {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-[#111111] dark:text-slate-100 flex items-center justify-center font-sans">
        <p className="text-sm font-bold animate-pulse text-kaya-orange">Loading Rider Portal...</p>
      </div>
    );
  }

  if (!riderSession) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center space-y-6">
          <div className="bg-orange-50 dark:bg-orange-950/20 text-kaya-orange p-4 rounded-3xl w-fit mx-auto border border-orange-100 dark:border-orange-900/30">
            <Truck className="h-10 w-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Rider Portal Sign In</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please sign in with your dispatch credentials to view assigned orders and navigate routes.
            </p>
          </div>
          <button 
            onClick={() => router.push("/rider/login")}
            className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-colors"
          >
            Go to Rider Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-[#111111] dark:text-slate-100 flex flex-col font-sans">
      
      {/* Header Navigation Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <Link href="/rider/dashboard" className="flex items-center space-x-2">
              <img 
                src="/k-1.png" 
                alt="Kaya Logo" 
                className="h-9 w-auto object-contain"
              />
              <span className="text-[10px] bg-kaya-orange text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                Rider Portal
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Real-time Rider Notifications */}
            {riderSession && (
              <NotificationDropdown role="RIDER" targetId={riderSession.id} />
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-kaya-orange" />
              )}
            </button>

            {/* Rider Info Badge */}
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 dark:bg-slate-850 px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-750">
              <img 
                src={riderSession.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${riderSession.riderId}`}
                alt={riderSession.fullName}
                className="w-8 h-8 rounded-full object-cover border border-kaya-orange"
              />
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{riderSession.fullName}</p>
                <p className="text-[9px] text-kaya-orange font-bold uppercase">{riderSession.riderId} ({riderSession.vehicleType})</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 px-3.5 py-2 rounded-xl transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
