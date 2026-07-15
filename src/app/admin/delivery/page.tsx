"use client";

import React, { useState } from "react";
import { Truck, Check, ShieldAlert, User, Star } from "lucide-react";

export default function AdminDeliveryDispatch() {
  const [riders, setRiders] = useState([
    { id: "r1", name: "Tunde Alao", status: "Out for Delivery", activeOrders: 1, phone: "+234 802 998 1122", rating: 4.8, vehicle: "Motorcycle (Lagos - AJ211)" },
    { id: "r2", name: "Emeka Obi", status: "Idle", activeOrders: 0, phone: "+234 811 556 7788", rating: 4.9, vehicle: "Motorcycle (Lagos - EK441)" },
    { id: "r3", name: "Ibrahim Musa", status: "Offline", activeOrders: 0, phone: "+234 809 333 4455", rating: 4.6, vehicle: "Motorcycle (Lagos - AB901)" }
  ]);

  const toggleRiderStatus = (id: string, newStatus: string) => {
    setRiders(riders.map(r => r.id === id ? { ...r, status: newStatus } as any : r));
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Riders & Dispatch Operations</h1>
        <p className="text-slate-400 text-xs mt-1">Manage KayaMarket dispatch fleet, vehicle routing and active delivery assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {riders.map((rider) => (
          <div key={rider.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
                <Truck className="h-6 w-6" />
              </div>
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                rider.status === "Idle" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                rider.status === "Offline" ? "bg-slate-800 text-slate-500 border-slate-700" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
              }`}>
                {rider.status}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <User className="h-4.5 w-4.5 text-slate-400" />
                <span>{rider.name}</span>
              </h3>
              
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>{rider.rating} Rating</span>
              </div>

              <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-850">
                <div>Vehicle: <span className="font-bold text-slate-200">{rider.vehicle}</span></div>
                <div>Phone: <span className="font-bold text-slate-200">{rider.phone}</span></div>
                <div>Active Orders: <span className="font-bold text-slate-200">{rider.activeOrders}</span></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-500">Toggle Dispatch:</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleRiderStatus(rider.id, "Out for Delivery")}
                  className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
                >
                  Deliver
                </button>
                <button 
                  onClick={() => toggleRiderStatus(rider.id, "Idle")}
                  className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors"
                >
                  Idle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
