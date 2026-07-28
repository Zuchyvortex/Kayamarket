"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Lock, ArrowRight, ShieldCheck, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPasswordWithToken } from "@/app/actions/authActions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [emailParam, tokenParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (!token || !email) {
      setErrorMsg("Missing token or email parameters.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const res = await resetPasswordWithToken({
        token,
        email,
        newPassword: password
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(res.error || "Failed to reset password.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
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
            <h1 className="text-2xl font-black tracking-tight">Reset Password</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Create a secure new password for your account</p>
          </div>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center py-4 relative z-10 animate-fade-in">
            <div className="p-3 bg-green-50 dark:bg-green-950/40 text-emerald-600 dark:text-emerald-400 rounded-full w-fit mx-auto border border-green-100 dark:border-green-900/40">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Password Reset Complete</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Your new password has been successfully configured. You can now use it to log into your account.
              </p>
            </div>
            <Link 
              href="/login" 
              className="inline-block bg-slate-900 dark:bg-kaya-orange hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-full text-xs transition-colors shadow-md"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {errorMsg && (
              <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-kaya-orange" />
                <span>Target Email</span>
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none text-xs font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-955 transition-all"
              />
            </div>

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
                className="w-full px-4.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-xs font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-955 transition-all"
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
                className="w-full px-4.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-xs font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-955 transition-all"
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

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 relative z-10">
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-bold">
        Loading reset parameters...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
