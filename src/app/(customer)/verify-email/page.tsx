"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    // Simulate API code verification
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 bg-white">
      <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-200 shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-kaya-orange/10 rounded-bl-[3rem]"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-kaya-green/10 rounded-tr-[3rem]"></div>
        
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verify Account</h1>
            <p className="text-xs text-slate-500">Confirm your email address to unlock premium access</p>
          </div>
        </div>

        {verified ? (
          <div className="space-y-6 text-center py-4 relative z-10 animate-fade-in">
            <div className="p-3 bg-green-50 text-kaya-green rounded-full w-fit mx-auto border border-green-100">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Email Address Verified</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Your account is now fully active. Enjoy shopping the premium marketplace catalog.
              </p>
            </div>
            <Link 
              href="/dashboard" 
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-full text-xs transition-colors"
            >
              Go to My Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-kaya-green" />
                <span>Verification Code</span>
              </label>
              <input 
                type="text" 
                required
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-center tracking-[0.5em] text-lg font-black text-slate-800 bg-white transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-xs orange-glow"
            >
              <span>{loading ? "Verifying..." : "Verify Code"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 flex flex-col gap-2 relative z-10">
          <p>
            Didn't receive a code? <button onClick={() => alert("Verification code resent!")} className="text-kaya-green hover:underline font-bold transition-colors">Resend Code</button>
          </p>
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-455 font-medium mt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-kaya-green" />
            <span>Secure Verification Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
