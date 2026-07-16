"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const result = await signIn("credentials", {
      redirect: false,
      email: email.trim(),
      password
    });
    
    setLoading(false);
    
    if (result?.error) {
      setErrorMsg(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
    } else {
      const session = await getSession();
      router.refresh();
      if (
        (session?.user && (session.user as any).role === 'ADMIN') ||
        email.toLowerCase().includes('admin') ||
        role === 'ADMIN'
      ) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-500">Sign in to your premium marketplace account</p>
          </div>
        </div>

        {/* Quick Test Role Selection */}
        <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-100 flex gap-2 relative z-10">
          <button 
            type="button"
            onClick={() => { setRole('CUSTOMER'); setEmail("chinedu@example.com"); setPassword("password123"); }}
            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none ${role === 'CUSTOMER' ? "bg-white text-kaya-orange shadow-md" : "text-slate-550 hover:text-slate-700"}`}
          >
            Customer Account
          </button>
          <button 
            type="button"
            onClick={() => { setRole('ADMIN'); setEmail("admin@kayamarket.com"); setPassword("admin123"); }}
            className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none ${role === 'ADMIN' ? "bg-white text-kaya-orange shadow-md" : "text-slate-550 hover:text-slate-700"}`}
          >
            Admin Access
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {errorMsg && (
            <div className="bg-rose-50 text-rose-600 text-xs font-bold p-3 rounded-xl border border-rose-100">
              {errorMsg}
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
              className="w-full px-4.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-xs font-semibold text-slate-700 bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-kaya-orange" />
                <span>Password</span>
              </label>
              <Link href="/forgot-password" className="text-[10px] text-kaya-orange hover:underline font-bold uppercase tracking-wider">
                Forgot?
              </Link>
            </div>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-xs font-semibold text-slate-700 bg-white transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-xs focus:outline-none"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 flex flex-col gap-2 relative z-10">
          <p>
            Don't have an account? <Link href="/register" className="text-kaya-orange hover:text-orange-600 font-bold transition-colors">Sign Up</Link>
          </p>
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-450 font-medium mt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-kaya-orange" />
            <span>Secure Enterprise Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
