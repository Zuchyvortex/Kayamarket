"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/actions/authActions";
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    const formData = new FormData();
    const parts = name.trim().split(/\s+/);
    formData.append("firstName", parts[0] || "");
    formData.append("lastName", parts.slice(1).join(" ") || "");
    formData.append("email", email.trim());
    formData.append("phone", phone.trim());
    formData.append("password", password);

    const result = await registerUser(formData);
    
    if (result.success) {
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password
      });
      
      setLoading(false);
      if (signInResult?.error) {
        setErrorMsg(signInResult.error === "CredentialsSignin" ? "Invalid email or password" : signInResult.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      setErrorMsg(result.error || "Registration failed");
      setLoading(false);
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h1>
            <p className="text-xs text-slate-550">Join KayaMarket for farm-fresh ingredients</p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4.5 relative z-10">
          {errorMsg && (
            <div className="bg-rose-50 text-rose-600 text-xs font-bold p-3 rounded-xl border border-rose-100">
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-kaya-orange" />
              <span>Full Name</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="Chinedu Okafor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-xs font-semibold text-slate-700 bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-kaya-orange" />
              <span>Phone Number</span>
            </label>
            <input 
              type="tel" 
              required
              placeholder="+234 803 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-xs font-semibold text-slate-700 bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-kaya-orange" />
              <span>Password</span>
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-xs focus:outline-none"
          >
            <span>{loading ? "Registering..." : "Create Account"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 flex flex-col gap-2 relative z-10">
          <p>
            Already have an account? <Link href="/login" className="text-kaya-orange hover:text-orange-600 font-bold transition-colors">Sign In</Link>
          </p>
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-450 font-medium mt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-kaya-orange" />
            <span>Secure Enterprise Registration</span>
          </div>
        </div>
      </div>
    </div>
  );
}
