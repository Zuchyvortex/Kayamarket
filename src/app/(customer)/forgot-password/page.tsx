"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, ShieldCheck, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/authActions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setSubmitted(true);
        if (res.resetUrl) {
          setResetUrl(res.resetUrl);
        }
      } else {
        setError(res.error || "Failed to process password reset request.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 bg-cover bg-center bg-no-repeat relative animate-in fade-in duration-700" style={{ backgroundImage: "url('/w-2.png')" }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 sm:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 relative overflow-hidden z-10 animate-in slide-in-from-bottom-8 duration-700">
        
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-kaya-orange/10 rounded-bl-[3rem]"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50/10 rounded-tr-[3rem]"></div>
        
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
            <h1 className="text-2xl font-black tracking-tight">Recover Password</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">We'll generate secure password recovery instructions for your email</p>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center py-4 relative z-10 animate-fade-in">
            <div className="p-3 bg-green-50 dark:bg-green-950/40 text-emerald-600 dark:text-emerald-400 rounded-full w-fit mx-auto border border-green-100 dark:border-green-900/40">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Reset Instructions Dispatched</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                If an account is associated with <strong className="text-slate-900 dark:text-white">{email}</strong>, you can use the secure link below to reset your password.
              </p>
            </div>

            {resetUrl && (
              <div className="bg-orange-50 dark:bg-slate-800 p-4 rounded-2xl border border-orange-200 dark:border-slate-700 text-left space-y-2">
                <p className="text-[10px] font-black text-kaya-orange uppercase tracking-wider">Direct Secure Reset Link</p>
                <Link 
                  href={resetUrl}
                  className="text-xs font-bold text-slate-900 dark:text-white hover:text-kaya-orange flex items-center gap-1.5 break-all"
                >
                  <span>Click here to reset your password</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-kaya-orange" />
                </Link>
              </div>
            )}

            <Link 
              href="/login" 
              className="inline-block bg-slate-900 dark:bg-kaya-orange hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-full text-xs transition-colors shadow-md"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-kaya-orange" />
                <span>Email Address</span>
              </label>
              <input 
                type="email" 
                required
                placeholder="chinedu@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-xs font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-955 transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-xs focus:outline-none"
            >
              <span>{loading ? "Generating reset link..." : "Send Reset Link"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 relative z-10">
          <p>
            Remembered your password? <Link href="/login" className="text-kaya-orange hover:text-orange-600 font-bold transition-colors">Sign In</Link>
          </p>
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400 font-medium mt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-kaya-orange" />
            <span>Secure Recovery Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
