"use client";

import React, { useState } from "react";
import { PRODUCTS, Product } from "@/lib/mockData";
import { ShieldAlert, Plus, Minus } from "lucide-react";

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
    if (stock === 0) return <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-rose-100">Out of Stock</span>;
    if (stock < 10) return <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-100">Low Stock</span>;
    return <span className="bg-green-50 text-kaya-green px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-green-150">Healthy</span>;
  };

  return (
    <div className="space-y-10 bg-slate-50 text-[#111111]">
      <div>
        <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Stock Console</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Inventory & Low-Stock Alerts</h1>
        <p className="text-slate-550 text-xs">Monitor and modify stock counts in real time. Zero lag.</p>
      </div>

      {/* Danger alerts indicator */}
      {products.some(p => p.inventory < 10) && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex items-center gap-4 text-xs text-amber-800 leading-normal font-semibold">
          <ShieldAlert className="h-6 w-6 shrink-0 text-amber-500 animate-pulse" />
          <span>
            Attention: There are <strong className="text-slate-950 font-black">{products.filter(p => p.inventory < 10).length} items</strong> currently running low on stock. Please restock or adjust levels to prevent customer ordering failures.
          </span>
        </div>
      )}

      {/* Stock list table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Foodstuff info</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Quick Tune</th>
                <th className="px-6 py-4 text-center">Set Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-750">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-200">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 max-w-[200px] truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.weight || "Pack"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-500">{p.sku}</td>
                  <td className="px-6 py-4">{getStockBadge(p.inventory)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-base font-black ${p.inventory < 10 ? "text-rose-600" : "text-kaya-green"}`}>
                      {p.inventory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStockAdjustment(p.id, -5)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-950 transition-all border border-slate-200"
                        title="Reduce by 5"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleStockAdjustment(p.id, 5)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-950 transition-all border border-slate-200"
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
                        className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-center text-slate-800 focus:outline-none focus:border-kaya-orange font-bold text-xs"
                      />
                      <button 
                        onClick={() => handleSaveManualStock(p.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors shadow-sm"
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
