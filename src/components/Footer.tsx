"use client";

import React from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-green-950 text-green-50/80 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-green-800/50 pb-12 mb-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <div className="bg-green-600 p-1.5 rounded-lg text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">KayaMarket</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Nigeria's premium single-vendor online grocery platform. Sourced directly from farms, delivered with warmth.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-amber-400 transition-colors">Home Page</Link></li>
            <li><Link href="/products" className="hover:text-amber-400 transition-colors">Browse Products</Link></li>
            <li><Link href="/faq" className="hover:text-amber-400 transition-colors">Frequently Asked Questions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Product Categories</h4>
          <ul className="space-y-3 text-sm font-light">
            <li><Link href="/products?category=rice" className="hover:text-amber-400 transition-colors">Rice & Grains</Link></li>
            <li><Link href="/products?category=beans" className="hover:text-amber-400 transition-colors">Beans & Legumes</Link></li>
            <li><Link href="/products?category=vegetables" className="hover:text-amber-400 transition-colors">Fresh Vegetables</Link></li>
            <li><Link href="/products?category=yam" className="hover:text-amber-400 transition-colors">Tubers & Roots</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Stay Updated</h4>
          <p className="text-sm mb-4 font-light">Subscribe to our newsletter for weekly deals and fresh farm baskets.</p>
          <div className="flex max-w-sm">
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full px-4 py-2 text-xs rounded-l-xl bg-green-900 border border-green-800 focus:outline-none focus:border-amber-400 text-white" 
            />
            <button className="bg-amber-500 hover:bg-amber-400 text-green-950 px-4 py-2 rounded-r-xl font-semibold text-xs transition-colors shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs flex flex-col md:flex-row justify-between items-center gap-4 text-green-200/60">
        <p>© {new Date().getFullYear()} KayaMarket. All rights reserved.</p>
        <p className="font-semibold text-green-100/50 tracking-wider">
          Made by Zuchy Vortex Media
        </p>
      </div>
    </footer>
  );
}
