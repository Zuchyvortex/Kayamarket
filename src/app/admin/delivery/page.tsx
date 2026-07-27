"use client";

import React, { useState, useEffect } from "react";
import { 
  Truck, User, Plus, Edit2, Trash2, ShieldAlert, CheckCircle2, 
  XCircle, Phone, Mail, MapPin, Eye, FileText, Star, Search, Filter, ShieldCheck
} from "lucide-react";
import { getRiders, createRider, updateRider, updateRiderStatus, deleteRider } from "@/app/actions/riderActions";

export default function AdminDeliveryDispatch() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add/Edit Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleType, setVehicleType] = useState<"MOTORCYCLE" | "CAR" | "VAN">("MOTORCYCLE");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "OFFLINE" | "SUSPENDED">("ACTIVE");
  const [notes, setNotes] = useState("");

  // Profile View Modal
  const [viewRider, setViewRider] = useState<any>(null);

  useEffect(() => {
    fetchRiders();

    // Sync polling every 4s
    const interval = setInterval(fetchRiders, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchRiders = async () => {
    try {
      const data = await getRiders();
      setRiders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingRider(null);
    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setAddress("");
    setVehicleType("MOTORCYCLE");
    setVehicleRegistration("");
    setProfilePhoto("");
    setStatus("ACTIVE");
    setNotes("");
    setIsFormOpen(true);
  };

  const openEditForm = (rider: any) => {
    setEditingRider(rider);
    setFullName(rider.fullName);
    setPhoneNumber(rider.phoneNumber);
    setEmail(rider.email);
    setAddress(rider.address);
    setVehicleType(rider.vehicleType);
    setVehicleRegistration(rider.vehicleRegistration);
    setProfilePhoto(rider.profilePhoto || "");
    setStatus(rider.status);
    setNotes(rider.notes || "");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingRider) {
        const result = await updateRider(editingRider.id, {
          fullName,
          phoneNumber,
          email,
          address,
          vehicleType,
          vehicleRegistration,
          profilePhoto,
          status,
          notes
        });
        if (result.success) {
          await fetchRiders();
          setIsFormOpen(false);
        } else {
          alert(result.error || "Failed to update rider.");
        }
      } else {
        const result = await createRider({
          fullName,
          phoneNumber,
          email,
          address,
          vehicleType,
          vehicleRegistration,
          profilePhoto,
          status,
          notes
        });
        if (result.success) {
          await fetchRiders();
          setIsFormOpen(false);
        } else {
          alert(result.error || "Failed to create rider.");
        }
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: "ACTIVE" | "OFFLINE" | "SUSPENDED") => {
    try {
      const result = await updateRiderStatus(id, newStatus);
      if (result.success) {
        await fetchRiders();
      } else {
        alert(result.error || "Failed to change status.");
      }
    } catch (err: any) {
      alert(err.message || "Status change error.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dispatch rider?")) return;
    try {
      const result = await deleteRider(id);
      if (result.success) {
        await fetchRiders();
      } else {
        alert(result.error || "Failed to delete rider.");
      }
    } catch (err: any) {
      alert(err.message || "Delete error.");
    }
  };

  const filteredRiders = riders.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    return !q || 
      r.fullName.toLowerCase().includes(q) ||
      r.riderId.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phoneNumber.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 bg-slate-50 dark:bg-slate-950 text-[#111111] dark:text-slate-100 font-sans pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Fleet Operations</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Riders & Dispatch Management
          </h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs">
            Manage fleet accounts, vehicle details, active delivery dispatches, and rider performance metrics.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="bg-kaya-orange hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Rider</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[2rem] shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rider by Name, Rider ID, Phone..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
          />
        </div>
        <div className="text-xs font-bold text-slate-400 hidden sm:block">
          {filteredRiders.length} Registered Rider(s)
        </div>
      </div>

      {/* Riders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredRiders.map((rider) => {
          const activeOrdersCount = rider.orders?.filter((o: any) => o.status !== "COMPLETED" && o.status !== "CANCELLED").length || 0;
          const completedOrdersCount = rider.orders?.filter((o: any) => o.status === "COMPLETED").length || 0;

          return (
            <div 
              key={rider.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] space-y-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img 
                    src={rider.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rider.riderId}`}
                    alt={rider.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-kaya-orange shadow-sm"
                  />
                  <div>
                    <span className="text-[9px] font-black uppercase text-kaya-orange tracking-widest">{rider.riderId}</span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{rider.fullName}</h3>
                  </div>
                </div>

                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                  rider.status === "ACTIVE" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200" :
                  rider.status === "OFFLINE" ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200" : 
                  "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200"
                }`}>
                  {rider.status}
                </span>
              </div>

              {/* Specs */}
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 font-medium">
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-kaya-orange shrink-0" />
                  <span>Vehicle: <strong className="text-slate-900 dark:text-white">{rider.vehicleType} ({rider.vehicleRegistration})</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Phone: <strong className="text-slate-900 dark:text-white">{rider.phoneNumber}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Email: <strong className="text-slate-900 dark:text-white">{rider.email}</strong></span>
                </div>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center text-xs">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Active Orders</p>
                  <p className="font-black text-kaya-orange">{activeOrdersCount}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Delivered</p>
                  <p className="font-black text-emerald-600 dark:text-emerald-400">{completedOrdersCount}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setViewRider(rider)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold transition-colors text-xs"
                    title="View Profile & Deliveries"
                  >
                    <Eye className="h-4 w-4 text-kaya-orange" />
                  </button>

                  <button 
                    onClick={() => openEditForm(rider)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold transition-colors text-xs"
                    title="Edit Rider"
                  >
                    <Edit2 className="h-4 w-4 text-blue-500" />
                  </button>

                  <button 
                    onClick={() => handleDelete(rider.id)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 font-bold transition-colors text-xs"
                    title="Delete Rider"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex gap-1">
                  {rider.status !== "ACTIVE" && (
                    <button
                      onClick={() => handleToggleStatus(rider.id, "ACTIVE")}
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase rounded-lg border border-emerald-200"
                    >
                      Activate
                    </button>
                  )}
                  {rider.status !== "OFFLINE" && (
                    <button
                      onClick={() => handleToggleStatus(rider.id, "OFFLINE")}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase rounded-lg"
                    >
                      Offline
                    </button>
                  )}
                  {rider.status !== "SUSPENDED" && (
                    <button
                      onClick={() => handleToggleStatus(rider.id, "SUSPENDED")}
                      className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase rounded-lg border border-rose-200"
                    >
                      Suspend
                    </button>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Rider Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {editingRider ? "Edit Dispatch Rider" : "Add New Fleet Rider"}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tunde Alao"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Phone Number</label>
                  <input 
                    type="text" 
                    required 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+234 802 998 1122"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rider@kayamarket.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="MOTORCYCLE">Motorcycle</option>
                    <option value="CAR">Car</option>
                    <option value="VAN">Van</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Vehicle Registration No</label>
                  <input 
                    type="text" 
                    required 
                    value={vehicleRegistration}
                    onChange={(e) => setVehicleRegistration(e.target.value)}
                    placeholder="e.g. Lagos - AJ211-LS"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Address</label>
                <input 
                  type="text" 
                  required 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Profile Photo URL (Optional)</label>
                <input 
                  type="text" 
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Notes</label>
                <textarea 
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Rider notes, preferred dispatch zones..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? "Saving Rider..." : editingRider ? "Update Rider Profile" : "Create Rider Account"}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* View Rider Profile Modal */}
      {viewRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={viewRider.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewRider.riderId}`}
                  alt={viewRider.fullName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-kaya-orange"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{viewRider.fullName}</h3>
                  <p className="text-xs text-kaya-orange font-bold">{viewRider.riderId} • {viewRider.vehicleType} ({viewRider.vehicleRegistration})</p>
                </div>
              </div>
              <button onClick={() => setViewRider(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                <p className="font-black text-slate-900 dark:text-white">{viewRider.status}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Active Dispatches</p>
                <p className="font-black text-kaya-orange">{viewRider.orders?.filter((o: any) => o.status !== "COMPLETED" && o.status !== "CANCELLED").length || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Total Completed</p>
                <p className="font-black text-emerald-600">{viewRider.orders?.filter((o: any) => o.status === "COMPLETED").length || 0}</p>
              </div>
            </div>

            {/* Delivery History */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase text-slate-400">Rider Delivery History</p>
              {viewRider.orders?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No assigned orders recorded for this rider.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {viewRider.orders?.map((o: any) => (
                    <div key={o.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-955 p-3 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{o.orderNumber} ({o.customerName})</p>
                        <p className="text-[10px] text-slate-400">{o.deliveryAddress}</p>
                      </div>
                      <span className="font-black uppercase text-[10px] text-kaya-orange">{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setViewRider(null)}
              className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
