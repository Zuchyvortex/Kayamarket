"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Globe, Mail, Phone, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      alert("Subscribed successfully!");
      setEmail("");
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      
      {/* Trust Badges Bar */}
      <div className="border-b border-slate-800 bg-slate-950/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 px-4">
            <div className="p-3 bg-kaya-orange/10 rounded-2xl text-kaya-orange shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">24h Scheduled Delivery</h4>
              <p className="text-xs text-slate-550 mt-0.5">Flexible time windows at checkout</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 px-4">
            <div className="p-3 bg-kaya-orange/10 rounded-2xl text-kaya-orange shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Quality Checked</h4>
              <p className="text-xs text-slate-550 mt-0.5">Thoroughly sorted, stone-free foodstuffs</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 px-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant Return Policy</h4>
              <p className="text-xs text-slate-550 mt-0.5">Return items on spot with dispatch rider</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        
        {/* Brand info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Logo placed in a premium white rounded container for proper brand visibility */}
          <div className="bg-white/95 backdrop-blur px-4 py-3 rounded-2xl w-fit shadow-md border border-white/10">
            <img 
              src="/k-1.png" 
              alt="KayaMarket Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="text-sm leading-relaxed max-w-sm text-slate-400">
            KayaMarket is Africa's premium marketplace for quality local foodstuffs, farm-fresh ingredients, and household essentials. Sourced directly from local farmers and delivered straight to your door.
          </p>
          <div className="flex space-x-3.5 pt-2">
            <a href="mailto:support@kayamarket.com" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-kaya-orange text-white flex items-center justify-center transition-colors" title="Email Support">
              <Mail className="h-4 w-4" />
            </a>
            <a href="/" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-kaya-orange text-white flex items-center justify-center transition-colors" title="Kaya Home">
              <Globe className="h-4 w-4" />
            </a>
            <a href="tel:+2348031234567" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-kaya-orange text-white flex items-center justify-center transition-colors" title="Call Us">
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Company links */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6">Company</h4>
          <ul className="space-y-3.5 text-sm font-semibold">
            <li><Link href="/products" className="hover:text-kaya-orange transition-colors">About Us</Link></li>
            <li><Link href="/products" className="hover:text-kaya-orange transition-colors">Careers</Link></li>
            <li><Link href="/products" className="hover:text-kaya-orange transition-colors">Partnerships</Link></li>
            <li><Link href="/products" className="hover:text-kaya-orange transition-colors">Bulk Orders</Link></li>
          </ul>
        </div>

        {/* Support links */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6">Help & Support</h4>
          <ul className="space-y-3.5 text-sm font-semibold">
            <li><Link href="/products" className="hover:text-kaya-orange transition-colors">Help Center</Link></li>
            <li><Link href="/products" className="hover:text-kaya-orange transition-colors">Refund Policy</Link></li>
            <li><Link href="/products" className="hover:text-kaya-orange transition-colors">Delivery Areas</Link></li>
            <li><Link href="/products" className="hover:text-kaya-orange transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className="space-y-6">
          <h4 className="text-white font-bold text-sm tracking-widest uppercase">Newsletter</h4>
          <p className="text-xs text-slate-550 leading-relaxed">
            Subscribe to our weekly food basket news, special promotions, and direct farm updates.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-sm">
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address" 
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:border-kaya-orange text-white placeholder-slate-500 font-semibold" 
            />
            <button type="submit" className="bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shrink-0 flex items-center justify-center gap-1 focus:outline-none">
              <span>Subscribe</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </form>
          
          <div className="pt-2">
            <p className="text-[10px] text-slate-550 uppercase tracking-widest font-black">Accepted Payments</p>
            <div className="flex gap-2 mt-2 opacity-60">
              <span className="bg-slate-850 px-2 py-1 rounded text-[10px] font-bold text-white">VISA</span>
              <span className="bg-slate-850 px-2 py-1 rounded text-[10px] font-bold text-white">MASTERCARD</span>
              <span className="bg-slate-850 px-2 py-1 rounded text-[10px] font-bold text-white">VERVE</span>
              <span className="bg-slate-850 px-2 py-1 rounded text-[10px] font-bold text-white">TRANSFER</span>
            </div>
          </div>
        </div>

      </div>
      
      {/* Copyright Footer */}
      <div className="border-t border-slate-800/80 py-8 bg-slate-950/20 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} KayaMarket E-Commerce. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/products" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/products" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <p className="font-bold text-slate-600/80 tracking-wider">
            Premium Platform by Zuchy Vortex Media
          </p>
        </div>
      </div>

    </footer>
  );
}
