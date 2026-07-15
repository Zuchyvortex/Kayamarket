"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Leaf, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    const success = await login(email, role);
    setLoading(false);
    
    if (success) {
      if (role === 'ADMIN' || email.toLowerCase().includes('admin')) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8 relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-[3rem]"></div>
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="bg-green-600 p-2.5 rounded-2xl text-white w-fit mx-auto mb-4">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to your KayaMarket account</p>
        </div>

        {/* Quick Role Select for Mock testing */}
        <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex gap-2">
          <button 
            type="button"
            onClick={() => { setRole('CUSTOMER'); if (!email) setEmail("chinedu@example.com"); }}
            className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all focus:outline-none ${role === 'CUSTOMER' ? "bg-white text-green-700 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700"}`}
          >
            Customer Test
          </button>
          <button 
            type="button"
            onClick={() => { setRole('ADMIN'); if (!email) setEmail("admin@kayamarket.com"); }}
            className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all focus:outline-none ${role === 'ADMIN' ? "bg-white text-green-700 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700"}`}
          >
            Admin Test
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span>Email Address</span>
            </label>
            <input 
              type="email" 
              required
              placeholder="e.g. chinedu@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-xs font-semibold text-slate-700 bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>Password</span>
            </label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-xs font-semibold text-slate-700 bg-white"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-xs"
          >
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-50 flex flex-col gap-2">
          <p>
            Don't have an account? <Link href="/register" className="text-green-600 hover:text-green-700 font-bold transition-colors">Sign Up</Link>
          </p>
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            <span>Encrypted mock authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
