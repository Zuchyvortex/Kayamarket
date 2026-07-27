"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, Lock, User, ArrowRight, ShieldCheck, Sun, Moon } from "lucide-react";
import { getRiders } from "@/app/actions/riderActions";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

export default function RiderLoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableRiders, setAvailableRiders] = useState<any[]>([]);

  useEffect(() => {
    fetchRidersList();
  }, []);

  const fetchRidersList = async () => {
    const riders = await getRiders();
    setAvailableRiders(riders);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const q = emailOrId.trim().toLowerCase();
      const matched = availableRiders.find(
        r => r.email.toLowerCase() === q || r.riderId.toLowerCase() === q || r.fullName.toLowerCase().includes(q)
      );

      if (!matched) {
        setError("Rider account not found. Please check Rider ID or Email.");
        setLoading(false);
        return;
      }

      if (matched.status === "SUSPENDED") {
        setError("Your Rider account is currently SUSPENDED. Please contact the administrator.");
        setLoading(false);
        return;
      }

      // Save rider session to localStorage
      localStorage.setItem("kayamarket_rider_session", JSON.stringify(matched));
      window.location.href = "/rider/dashboard";
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (rider: any) => {
    if (rider.status === "SUSPENDED") {
      setError("Your Rider account is currently SUSPENDED. Please contact the administrator.");
      return;
    }
    localStorage.setItem("kayamarket_rider_session", JSON.stringify(rider));
    window.location.href = "/rider/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-[#111111] dark:text-slate-100 font-sans">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/k-1.png" alt="Kaya Logo" className="h-9 w-auto object-contain" />
          <span className="text-[10px] bg-slate-900 dark:bg-slate-800 text-white font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            Rider Portal
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none"
        >
          {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5 text-kaya-orange" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl space-y-6 my-12">
        
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/30 text-kaya-orange rounded-3xl flex items-center justify-center mx-auto border border-orange-100 dark:border-orange-900/30">
            <Truck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Dispatch Rider Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to view assigned delivery packages and update customer fulfillment stages
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Rider Email or ID
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                required 
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                placeholder="e.g. tunde@kayamarket.com or RIDER-1001"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 text-xs focus:outline-none disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Access Dispatch Portal"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Select Rider Demo Accounts */}
        {availableRiders.length > 0 && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
              Quick Test Sign In (Available Fleet)
            </p>
            <div className="space-y-2">
              {availableRiders.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleQuickSelect(r)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-955 hover:bg-orange-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={r.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.riderId}`}
                      alt={r.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-kaya-orange">
                        {r.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {r.riderId} • {r.vehicleType}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-kaya-orange opacity-0 group-hover:opacity-100 transition-opacity">
                    Log in →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="text-center text-xs text-slate-400 dark:text-slate-500">
        KayaMarket Logistics & Fleet Management System © 2026
      </div>

    </div>
  );
}
