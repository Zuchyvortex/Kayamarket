"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Plus, Search, Edit, Trash2, MapPin, Phone, Mail, 
  Calendar, CheckCircle2, RefreshCw, ShoppingBag, ShieldCheck, Tag 
} from "lucide-react";
import { getFarmers, createOrUpdateFarmer, deleteFarmer } from "@/app/actions/farmerActions";

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [productsSuppliedInput, setProductsSuppliedInput] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [commissionRate, setCommissionRate] = useState<number>(5.0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    setLoading(true);
    try {
      const data = await getFarmers();
      setFarmers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setFarmLocation("");
    setProductsSuppliedInput("");
    setStatus("ACTIVE");
    setCommissionRate(5.0);
    setNotes("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (f: any) => {
    setEditingId(f.id);
    setName(f.name || "");
    setPhone(f.phone || "");
    setEmail(f.email || "");
    setAddress(f.address || "");
    setFarmLocation(f.farmLocation || "");
    setProductsSuppliedInput(Array.isArray(f.productsSupplied) ? f.productsSupplied.join(", ") : "");
    setStatus(f.status || "ACTIVE");
    setCommissionRate(Number(f.commissionRate || 5.0));
    setNotes(f.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Farmer or partner name is required.");
      return;
    }

    setSaving(true);
    const parsedProducts = productsSuppliedInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = await createOrUpdateFarmer({
        id: editingId || undefined,
        name,
        phone,
        email,
        address,
        farmLocation,
        productsSupplied: parsedProducts,
        status,
        commissionRate,
        notes
      });

      if (res.success) {
        setIsModalOpen(false);
        await loadFarmers();
      } else {
        alert(res.error || "Failed to save farmer profile.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save farmer profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this farmer partner profile?")) return;
    try {
      const res = await deleteFarmer(id);
      if (res.success) {
        await loadFarmers();
      } else {
        alert(res.error || "Failed to delete farmer profile.");
      }
    } catch (e: any) {
      alert(e.message || "Failed to delete farmer profile.");
    }
  };

  const filteredFarmers = farmers.filter(f => {
    const term = searchQuery.toLowerCase();
    return (
      f.name?.toLowerCase().includes(term) ||
      f.farmLocation?.toLowerCase().includes(term) ||
      f.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-orange-50 dark:bg-orange-950/40 text-kaya-orange px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-900/40">
            <Users className="h-3.5 w-3.5" />
            <span>Farm Supply Partners</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Farmers & Supply Partners
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage partner farmers, farm locations, supplied foodstuff categories, and procurement commissions.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition-all text-xs flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Farmer Profile</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by farmer name, location, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
          />
        </div>
        <div className="text-xs font-bold text-slate-400">
          Total Registered: <span className="text-slate-900 dark:text-white font-black">{farmers.length} Farmers</span>
        </div>
      </div>

      {/* Farmers Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-kaya-orange animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400">Loading Farmers Directory...</p>
        </div>
      ) : filteredFarmers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-16 rounded-[2.5rem] text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-xs font-bold text-slate-400">No farmer profiles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map((farmer) => (
            <div 
              key={farmer.id}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black uppercase text-kaya-orange tracking-widest">Verified Supplier</span>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">{farmer.name}</h3>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                    farmer.status === "ACTIVE" 
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200 dark:border-emerald-900/30" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}>
                    {farmer.status || "ACTIVE"}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  {farmer.farmLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-kaya-orange shrink-0" />
                      <span>{farmer.farmLocation}</span>
                    </div>
                  )}
                  {farmer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{farmer.phone}</span>
                    </div>
                  )}
                  {farmer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{farmer.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>Joined: {new Date(farmer.dateJoined || farmer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Products supplied tag list */}
                {Array.isArray(farmer.productsSupplied) && farmer.productsSupplied.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase text-slate-400">Supplied Products</span>
                    <div className="flex flex-wrap gap-1">
                      {farmer.productsSupplied.map((prod: string, i: number) => (
                        <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 text-[10px]">
                  Commission: <span className="text-slate-900 dark:text-white font-black">{farmer.commissionRate}%</span>
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(farmer)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-kaya-orange hover:text-white transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(farmer.id)}
                    className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors border border-rose-200 dark:border-rose-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT FARMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingId ? "Edit Farmer Partner Profile" : "Register Farmer / Supply Partner"}
                </h3>
                <p className="text-xs text-slate-400">Configure farm location, contact details, and products supplied.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveFarmer} className="space-y-4 text-xs font-bold">
              
              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px]">Farmer / Co-op Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Alhaji Musa Grain Farms"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px]">Phone Number</label>
                  <input 
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px]">Farm Location</label>
                  <input 
                    type="text"
                    placeholder="e.g. Kebbi State"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px]">Supplied Products (Comma Separated)</label>
                <input 
                  type="text"
                  placeholder="Parboiled Rice, Oloyin Beans, White Yam"
                  value={productsSuppliedInput}
                  onChange={(e) => setProductsSuppliedInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px]">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px]">Commission Rate (%)</label>
                  <input 
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
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
                  {saving ? "Saving..." : editingId ? "Update Profile" : "Register Farmer"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
