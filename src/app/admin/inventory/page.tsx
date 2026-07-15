"use client";

import React, { useState } from "react";
import { PRODUCTS, Product } from "@/lib/mockData";
import { RefreshCw, ArrowUp, ArrowDown, ShieldAlert, Plus, Minus } from "lucide-react";

export default function AdminInventoryManager() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [manualInputs, setManualInputs] = useState<{ [key: string]: number }>({});

  const handleStockAdjustment = (productId: string, amount: number) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.inventory + amount);
        return { ...p, inventory: newStock };
      }
      return p;
    }));
  };

  const handleManualStockChange = (productId: string, val: string) => {
    const num = parseInt(val);
    if (!isNaN(num)) {
      setManualInputs({ ...manualInputs, [productId]: num });
    }
  };

  const handleSaveManualStock = (productId: string) => {
    const newVal = manualInputs[productId];
    if (newVal !== undefined) {
      setProducts(products.map(p => {
        if (p.id === productId) {
          return { ...p, inventory: newVal };
        }
        return p;
      }));
      alert("Stock level updated successfully!");
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="bg-rose-500/10 text-rose-500 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">Out of Stock</span>;
    if (stock < 10) return <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">Low Stock</span>;
    return <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-sans">Healthy Stock</span>;
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Inventory & Low-Stock Alerts</h1>
        <p className="text-slate-400 text-xs mt-1">Monitor and modify stock counts in real time. Zero lag.</p>
      </div>

      {/* Danger alerts indicator */}
      {products.some(p => p.inventory < 10) && (
        <div className="bg-amber-500/10 border border-amber-500/25 p-5 rounded-3xl flex items-center gap-4 text-xs text-amber-300 leading-normal">
          <ShieldAlert className="h-6 w-6 shrink-0 text-amber-500 animate-pulse" />
          <span>
            Attention: There are **{products.filter(p => p.inventory < 10).length} items** currently running low on stock. Please restock or adjust levels to prevent customer ordering failures.
          </span>
        </div>
      )}

      {/* Stock list table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Foodstuff info</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Quick Tune</th>
                <th className="px-6 py-4 text-center">Set Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-800">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white max-w-[200px] truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{p.weight || "N/A"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-400">{p.sku}</td>
                  <td className="px-6 py-4">{getStockBadge(p.inventory)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-base font-black ${p.inventory < 10 ? "text-rose-500" : "text-emerald-500"}`}>
                      {p.inventory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStockAdjustment(p.id, -5)}
                        className="p-1.5 bg-slate-850 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Reduce by 5"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleStockAdjustment(p.id, 5)}
                        className="p-1.5 bg-slate-850 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Add 5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <input 
                        type="number" 
                        placeholder={p.inventory.toString()}
                        value={manualInputs[p.id] !== undefined ? manualInputs[p.id] : ""}
                        onChange={(e) => handleManualStockChange(p.id, e.target.value)}
                        className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center text-white focus:outline-none focus:border-green-500"
                      />
                      <button 
                        onClick={() => handleSaveManualStock(p.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold uppercase transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
