"use client";

import React, { useState } from "react";
import { Truck, User, Star } from "lucide-react";

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
    <div className="space-y-10 bg-slate-50 text-[#111111]">
      <div>
        <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Fleet Operations</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Riders & Dispatch Operations</h1>
        <p className="text-slate-550 text-xs">Manage KayaMarket dispatch fleet, vehicle routing and active delivery assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {riders.map((rider) => (
          <div key={rider.id} className="bg-white border border-slate-200 p-6 rounded-[2rem] space-y-6 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-orange-50 text-kaya-orange rounded-2xl flex items-center justify-center border border-orange-100">
                <Truck className="h-6 w-6" />
              </div>
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                rider.status === "Idle" ? "bg-green-50 text-kaya-green border-green-150" :
                rider.status === "Offline" ? "bg-slate-100 text-slate-450 border-slate-200" : 
                "bg-blue-50 text-blue-600 border-blue-150"
              }`}>
                {rider.status}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <User className="h-4.5 w-4.5 text-slate-400" />
                <span>{rider.name}</span>
              </h3>
              
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{rider.rating} Rating</span>
              </div>

              <div className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100 font-semibold">
                <div>Vehicle: <span className="font-extrabold text-slate-800">{rider.vehicle}</span></div>
                <div>Phone: <span className="font-extrabold text-slate-800">{rider.phone}</span></div>
                <div>Active Orders: <span className="font-extrabold text-slate-800">{rider.activeOrders}</span></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
              <span className="text-slate-450">Toggle Dispatch:</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleRiderStatus(rider.id, "Out for Delivery")}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-100"
                >
                  Deliver
                </button>
                <button 
                  onClick={() => toggleRiderStatus(rider.id, "Idle")}
                  className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-kaya-green rounded-lg transition-colors border border-green-100"
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
