"use client";

import React, { useState, useEffect } from "react";
import { getInventoryMetrics, adjustInventoryStock } from "@/app/actions/inventoryActions";
import { ShieldAlert, Plus, Minus, Loader2, PackageCheck, Clock, AlertTriangle, Layers, Save } from "lucide-react";

export default function AdminInventoryManager() {
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalProductsCount: 0,
    totalPhysicalUnits: 0,
    totalReservedUnits: 0,
    totalAvailableUnits: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });
  const [manualInputs, setManualInputs] = useState<{ [key: string]: number }>({});
  const [thresholdInputs, setThresholdInputs] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    const res = await getInventoryMetrics();
    if (res.success) {
      setInventoryList(res.inventoryList);
      setSummary(res.summary);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStockAdjustment = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    setInventoryList(prev => prev.map(p => p.id === productId ? { ...p, currentStock: newStock, availableStock: Math.max(0, newStock - p.reservedStock) } : p));
    const res = await adjustInventoryStock({ productId, newInventory: newStock });
    if (!res.success) {
      alert("Failed to adjust stock level");
      fetchMetrics();
    }
  };

  const handleSaveStock = async (productId: string) => {
    const p = inventoryList.find(item => item.id === productId);
    const newStock = manualInputs[productId] !== undefined ? manualInputs[productId] : p.currentStock;
    const newThreshold = thresholdInputs[productId] !== undefined ? thresholdInputs[productId] : p.minStockThreshold;

    const res = await adjustInventoryStock({
      productId,
      newInventory: newStock,
      minStockThreshold: newThreshold
    });

    if (res.success) {
      alert("Inventory and threshold updated successfully!");
      fetchMetrics();
    } else {
      alert("Failed to save changes.");
    }
  };

  const getStockBadge = (item: any) => {
    if (item.isOutOfStock) return <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-rose-200 dark:border-rose-900/40">Out of Stock</span>;
    if (item.isLowStock) return <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-900/40">Low Stock Alert</span>;
    return <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/40">Healthy</span>;
  };

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div>
        <span className="text-kaya-orange font-black text-xs uppercase tracking-widest">REAL-TIME STOCK SYNC</span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">Inventory & Stock Alerts</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Synchronized with customer orders. Reserved stock is calculated automatically.
        </p>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Physical Stock</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.totalPhysicalUnits} <span className="text-xs text-slate-400 font-normal">units</span></p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Reserved Stock
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{summary.totalReservedUnits} <span className="text-xs text-slate-400 font-normal">units</span></p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1">
            <PackageCheck className="h-3 w-3" />
            Available Stock
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.totalAvailableUnits} <span className="text-xs text-slate-400 font-normal">units</span></p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Low & Out of Stock
          </span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{summary.lowStockCount + summary.outOfStockCount} <span className="text-xs text-slate-400 font-normal">items</span></p>
        </div>
      </div>

      {/* Low stock warning banner */}
      {(summary.lowStockCount > 0 || summary.outOfStockCount > 0) && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-5 rounded-3xl flex items-center gap-4 text-xs text-amber-800 dark:text-amber-300 font-semibold">
          <ShieldAlert className="h-6 w-6 shrink-0 text-amber-500 animate-pulse" />
          <span>
            Attention: <strong className="font-black text-slate-900 dark:text-white">{summary.lowStockCount} items</strong> are running low on stock and <strong className="font-black text-rose-600 dark:text-rose-400">{summary.outOfStockCount} items</strong> are completely out of stock. Please adjust levels or re-stock.
          </span>
        </div>
      )}

      {/* Inventory table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Physical Stock</th>
                <th className="px-6 py-4 text-center">Reserved</th>
                <th className="px-6 py-4 text-center">Available</th>
                <th className="px-6 py-4 text-center">Min Threshold</th>
                <th className="px-6 py-4 text-center">Actions & Updates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-kaya-orange animate-spin mx-auto" />
                  </td>
                </tr>
              ) : inventoryList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                  
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      <img src={p.images?.[0] || "/w-1.png"} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white max-w-[180px] truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{p.categoryName} • {p.sku}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">{getStockBadge(p)}</td>

                  <td className="px-6 py-4 text-center">
                    <span className="text-base font-black text-slate-900 dark:text-white">{p.currentStock}</span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{p.reservedStock}</span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`text-base font-black ${p.availableStock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {p.availableStock}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <input 
                      type="number"
                      value={thresholdInputs[p.id] !== undefined ? thresholdInputs[p.id] : p.minStockThreshold}
                      onChange={(e) => setThresholdInputs({ ...thresholdInputs, [p.id]: parseInt(e.target.value) || 1 })}
                      className="w-14 px-2 py-1 text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                    />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleStockAdjustment(p.id, p.currentStock, -5)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all"
                          title="Reduce by 5"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        
                        <input 
                          type="number" 
                          placeholder={p.currentStock.toString()}
                          value={manualInputs[p.id] !== undefined ? manualInputs[p.id] : ""}
                          onChange={(e) => setManualInputs({ ...manualInputs, [p.id]: parseInt(e.target.value) || 0 })}
                          className="w-16 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold text-xs"
                        />

                        <button 
                          onClick={() => handleStockAdjustment(p.id, p.currentStock, 5)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all"
                          title="Add 5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button 
                        onClick={() => handleSaveStock(p.id)}
                        className="px-3 py-1.5 bg-kaya-orange hover:bg-orange-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm flex items-center gap-1"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save</span>
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
