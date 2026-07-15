"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, ShieldCheck, Leaf, Truck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-green-900/90 mix-blend-multiply" />
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80" 
            alt="Fresh farm produce" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-green-500/20 text-green-300 text-xs font-bold uppercase tracking-wider mb-6 border border-green-500/30">
            KayaMarket E-Commerce Platform
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-8">
            Fresh Foodstuff,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">
              Delivered Fast.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-green-50 mx-auto mb-10 font-medium">
            Experience the convenience of premium online grocery shopping combined with the warmth of a traditional Nigerian market. Sourced directly from farmers, delivered fresh.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/products" 
              className="inline-flex justify-center items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black px-8 py-4 rounded-full transition-all hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Start Shopping</span>
            </Link>
            <Link 
              href="/login" 
              className="inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-bold px-8 py-4 rounded-full transition-all"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links / Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Fresh & Organic</h3>
              <p className="text-slate-500">We source our produce directly from trusted local farmers to ensure top quality.</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Secure Payments</h3>
              <p className="text-slate-500">Your transactions are protected with enterprise-grade encryption.</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Fast Delivery</h3>
              <p className="text-slate-500">Get your groceries delivered right to your doorstep, exactly when you need them.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Dev Navigation (Hidden in prod typically, but useful for architecture review) */}
      <section className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">Development Shortcuts</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/admin" className="text-sm font-bold text-green-400 hover:text-green-300">Admin Dashboard</Link>
            <span className="text-slate-700">•</span>
            <Link href="/dashboard" className="text-sm font-bold text-green-400 hover:text-green-300">Customer Dashboard</Link>
            <span className="text-slate-700">•</span>
            <Link href="/register" className="text-sm font-bold text-green-400 hover:text-green-300">Registration</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
