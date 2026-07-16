"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    // Simulate password update
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 bg-white">
      <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-200 shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-kaya-orange/10 rounded-bl-[3rem]"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50/50 rounded-tr-[3rem]"></div>
        
        {/* Logo and title */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block">
            <img 
              src="/k-1.png" 
              alt="KayaMarket Logo" 
              className="h-14 w-auto mx-auto object-contain"
            />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h1>
            <p className="text-xs text-slate-555">Create a secure new password for your account</p>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center py-4 relative z-10 animate-fade-in">
            <div className="p-3 bg-green-50 text-kaya-green rounded-full w-fit mx-auto border border-green-100">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Password Reset Complete</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Your new password has been successfully configured. You can now use it to log in.
              </p>
            </div>
            <Link 
              href="/login" 
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-full text-xs transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {errorMsg && (
              <div className="bg-rose-50 text-rose-600 text-xs font-bold p-3 rounded-xl border border-rose-100">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-kaya-orange" />
                <span>New Password</span>
              </label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-xs font-semibold text-slate-700 bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-kaya-orange" />
                <span>Confirm New Password</span>
              </label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-xs font-semibold text-slate-700 bg-white transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-xs focus:outline-none"
            >
              <span>{loading ? "Resetting password..." : "Confirm New Password"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 flex flex-col gap-2 relative z-10">
          <p>
            Cancel and return to <Link href="/login" className="text-kaya-orange hover:text-orange-600 font-bold transition-colors">Sign In</Link>
          </p>
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-450 font-medium mt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-kaya-orange" />
            <span>Secure Password Configuration</span>
          </div>
        </div>
      </div>
    </div>
  );
}
