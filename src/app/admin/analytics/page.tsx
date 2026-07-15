"use client";

import React from "react";
import { MOCK_ORDERS } from "@/lib/mockData";
import { TrendingUp, Award, BarChart3, PieChart, Activity } from "lucide-react";

export default function AdminAnalyticsDashboard() {
  const totalRevenue = MOCK_ORDERS.filter(o => o.status !== "Cancelled").reduce((acc, curr) => acc + curr.total, 0);
  const averageOrderValue = totalRevenue / MOCK_ORDERS.length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Sales & Revenue Analytics</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium">Observe store performance indicators and buyer conversions</p>
      </div>

      {/* Analytics grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Gross Store Revenue", val: formatPrice(totalRevenue), change: "₦120,000 pending clearance", icon: TrendingUp },
          { label: "Average Basket Size", val: formatPrice(averageOrderValue), change: "3 items per check-out avg", icon: Award },
          { label: "Conversion Rate", val: "4.8%", change: "+1.2% this quarter", icon: Activity }
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] text-green-500 font-bold">Healthy KPI</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{item.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{item.val}</h3>
              <p className="text-[10px] text-slate-500 mt-2 font-bold">{item.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Categories bar representation */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-green-500" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Top Selling Food Groups</h3>
          </div>

          <div className="space-y-4">
            {[
              { cat: "Rice & Grain", sales: "₦3.5M", pct: 85 },
              { cat: "Red Oils", sales: "₦2.1M", pct: 60 },
              { cat: "Tubers & Roots", sales: "₦1.8M", pct: 45 },
              { cat: "Proteins & Meat", sales: "₦1.4M", pct: 35 }
            ].map((bar, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>{bar.cat}</span>
                  <span>{bar.sales}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${bar.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics Widget */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3">
            <PieChart className="h-5 w-5 text-green-500" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Customer Hub Hotspots</h3>
          </div>

          <div className="space-y-4">
            {[
              { location: "Lekki Phase 1 / Ikoyi", pct: 52 },
              { location: "Ikeja GRA", pct: 28 },
              { location: "Yaba / Surulere", pct: 15 },
              { location: "Others", pct: 5 }
            ].map((spot, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="font-bold text-slate-350">{spot.location}</span>
                </div>
                <span className="font-black text-white">{spot.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
