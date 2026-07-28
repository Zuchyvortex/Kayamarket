"use client";

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Plus, Search, Filter, Calendar, Users, ArrowUpRight, 
  CheckCircle2, AlertCircle, RefreshCw, FileSpreadsheet, Layers, DollarSign 
} from "lucide-react";
import { getFarmers } from "@/app/actions/farmerActions";
import { getProducts } from "@/app/actions/productActions";
import { getProcurementRecords, createProcurementRecord } from "@/app/actions/procurementActions";

export default function AdminProcurementPage() {
  const [procurements, setProcurements] = useState<any[]>([]);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [farmerId, setFarmerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [supplierNotes, setSupplierNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, fData, prodData] = await Promise.all([
        getProcurementRecords(),
        getFarmers(),
        getProducts()
      ]);
      setProcurements(pData || []);
      setFarmers(fData || []);
      setProducts(prodData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (pId: string) => {
    setProductId(pId);
    const prod = products.find(p => p.id === pId);
    if (prod && prod.costPrice) {
      setUnitPrice(Number(prod.costPrice));
    }
    if (prod && prod.farmerId) {
      setFarmerId(prod.farmerId);
    }
  };

  const handleCreateProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerId || !productId || !quantity || !unitPrice) {
      alert("Please select a farmer, a product, and enter valid quantity and unit price.");
      return;
    }

    setSaving(true);
    try {
      const res = await createProcurementRecord({
        farmerId,
        productId,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        supplierNotes
      });

      if (res.success) {
        setIsModalOpen(false);
        setFarmerId("");
        setProductId("");
        setQuantity("");
        setUnitPrice("");
        setSupplierNotes("");
        await loadData();
      } else {
        alert(res.error || "Failed to record procurement order.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create procurement order.");
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const filteredProcurements = procurements.filter(p => {
    const term = searchQuery.toLowerCase();
    return (
      p.farmer?.name?.toLowerCase().includes(term) ||
      p.product?.name?.toLowerCase().includes(term) ||
      p.supplierNotes?.toLowerCase().includes(term)
    );
  });

  const totalProcurementVolume = procurements.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
  const totalProcurementValuation = procurements.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-orange-50 dark:bg-orange-950/40 text-kaya-orange px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-900/40">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Farm Procurement Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Procurement & Stock Supplies
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record direct farm foodstuff procurement. Automatically increments inventory and updates cost prices.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition-all text-xs flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Farm Procurement</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400">Gross Procurement Cost</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{formatPrice(totalProcurementValuation)}</p>
          <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Live Synced to Financials
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400">Total Units Procured</span>
          <p className="text-2xl font-black text-kaya-orange">{totalProcurementVolume.toLocaleString()} Units</p>
          <span className="text-[10px] text-slate-400 font-semibold">Across all partner farms</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400">Procurement Logs</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{procurements.length} Records</p>
          <span className="text-[10px] text-slate-400 font-semibold">Audit verified</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by farmer, product, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
            />
          </div>
          <button 
            onClick={loadData}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-kaya-orange transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-kaya-orange animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading Procurement Logs...</p>
          </div>
        ) : filteredProcurements.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <ShoppingBag className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-bold">No procurement records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Farmer / Partner</th>
                  <th className="py-4 px-4">Product Supplied</th>
                  <th className="py-4 px-4">Quantity</th>
                  <th className="py-4 px-4">Unit Price</th>
                  <th className="py-4 px-4">Total Cost</th>
                  <th className="py-4 px-4">Supplier Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                {filteredProcurements.map((proc) => (
                  <tr key={proc.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(proc.date || proc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {proc.farmer?.name || "Direct Supplier"}
                    </td>
                    <td className="py-4 px-4 text-kaya-orange font-bold">
                      {proc.product?.name || "Foodstuff Item"}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                      +{proc.quantity} Units
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      {formatPrice(proc.unitPrice)}
                    </td>
                    <td className="py-4 px-4 font-black text-slate-900 dark:text-white">
                      {formatPrice(proc.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-slate-400 italic max-w-xs truncate">
                      {proc.supplierNotes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE PROCUREMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Record Farm Procurement</h3>
                <p className="text-xs text-slate-400">Automatically adds stock to inventory and updates product cost price.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateProcurement} className="space-y-4 text-xs font-bold">
              
              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px]">Select Partner Farmer</label>
                <select 
                  required
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Farmer --</option>
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.farmLocation || f.phone || "Supplier"})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px]">Select Product</label>
                <select 
                  required
                  value={productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.inventory})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px]">Purchase Quantity</label>
                  <input 
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px]">Unit Purchase Price (₦)</label>
                  <input 
                    type="number"
                    required
                    placeholder="e.g. 18000"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Total Calculation Preview */}
              {quantity && unitPrice && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/40 rounded-xl border border-orange-100 dark:border-orange-900/40 flex justify-between items-center text-kaya-orange">
                  <span>Gross Procurement Total:</span>
                  <span className="text-base font-black">{formatPrice(Number(quantity) * Number(unitPrice))}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px]">Supplier Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Quality grade, batch number, delivery notes..."
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-kaya-orange hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all"
                >
                  {saving ? "Saving..." : "Record Procurement"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
