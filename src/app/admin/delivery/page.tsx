"use client";

import React, { useState, useEffect } from "react";
import { 
  Truck, User, Plus, Edit2, Trash2, ShieldAlert, CheckCircle2, 
  XCircle, Phone, Mail, MapPin, Eye, FileText, Star, Search, Filter, 
  ShieldCheck, Copy, Printer, RefreshCw, Key, AlertCircle, Award
} from "lucide-react";
import { 
  getRiders, 
  createRider, 
  updateRider, 
  updateRiderStatus, 
  deleteRider,
  resetRiderPassword 
} from "@/app/actions/riderActions";
import ImageUploader from "@/components/ImageUploader";
import RiderPerformanceModal from "@/components/RiderPerformanceModal";

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
  const [emergencyContact, setEmergencyContact] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "OFFLINE" | "SUSPENDED">("ACTIVE");
  const [notes, setNotes] = useState("");

  // Generated Credentials Modal state
  const [credentialsModal, setCredentialsModal] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Profile View & Performance Modals
  const [viewRider, setViewRider] = useState<any>(null);
  const [performanceRider, setPerformanceRider] = useState<any>(null);

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
    setEmergencyContact("");
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
    setEmergencyContact(rider.emergencyContact || "");
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
          emergencyContact,
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
          emergencyContact,
          profilePhoto,
          status,
          notes
        });
        if (result.success) {
          await fetchRiders();
          setIsFormOpen(false);
          if (result.credentials) {
            setCredentialsModal({
              riderId: result.credentials.riderId,
              username: result.credentials.username,
              email: result.credentials.email,
              tempPassword: result.credentials.tempPassword,
              riderDbId: result.rider.id,
              fullName: result.rider.fullName
            });
          }
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

  const handleResetPassword = async (riderId: string) => {
    setRegenerating(true);
    try {
      const result = await resetRiderPassword(riderId);
      if (result.success && result.credentials) {
        setCredentialsModal({
          riderId: result.credentials.riderId,
          username: result.credentials.username,
          email: result.credentials.email,
          tempPassword: result.credentials.tempPassword,
          riderDbId: riderId,
          fullName: riders.find(r => r.id === riderId)?.fullName || "Dispatch Rider"
        });
      } else {
        alert(result.error || "Failed to reset password.");
      }
    } catch (err: any) {
      alert(err.message || "Error resetting password.");
    } finally {
      setRegenerating(false);
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

  const handleCopyCredentials = () => {
    if (!credentialsModal) return;
    const text = `KayaMarket Dispatch Credentials
----------------------------------
Rider Name: ${credentialsModal.fullName}
Rider ID: ${credentialsModal.riderId}
Username: ${credentialsModal.username}
Email: ${credentialsModal.email}
Temporary Password: ${credentialsModal.tempPassword}
Portal URL: ${window.location.origin}/rider/login`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handlePrintCredentials = () => {
    if (!credentialsModal) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>KayaMarket Rider Credentials - ${credentialsModal.riderId}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #111; }
            .card { border: 2px solid #ea580c; border-radius: 16px; padding: 24px; max-width: 480px; margin: auto; }
            h2 { color: #ea580c; margin-top: 0; }
            .row { margin-bottom: 12px; }
            .label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; }
            .value { font-size: 16px; font-weight: bold; }
            .footer { margin-top: 20px; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>KayaMarket Dispatch Account</h2>
            <div class="row"><div class="label">Rider Name</div><div class="value">${credentialsModal.fullName}</div></div>
            <div class="row"><div class="label">Rider ID</div><div class="value">${credentialsModal.riderId}</div></div>
            <div class="row"><div class="label">Username</div><div class="value">${credentialsModal.username}</div></div>
            <div class="row"><div class="label">Email Address</div><div class="value">${credentialsModal.email}</div></div>
            <div class="row"><div class="label">Temporary Password</div><div class="value" style="color: #ea580c">${credentialsModal.tempPassword}</div></div>
            <div class="footer">
              Sign in at: <strong>${window.location.origin}/rider/login</strong><br/>
              Please change your password upon first login.
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredRiders = riders.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    return !q || 
      r.fullName.toLowerCase().includes(q) ||
      r.riderId.toLowerCase().includes(q) ||
      (r.username && r.username.toLowerCase().includes(q)) ||
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
            Admin management console for creating riders, generating secure login dispatches, and auditing performance ratings.
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

      {/* Search Bar & Portal Link Badge */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[2rem] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rider by Name, Rider ID, Username, Phone..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-955 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <ShieldCheck className="h-4 w-4 text-kaya-orange shrink-0" />
          <span>Rider Portal URL:</span>
          <code className="text-kaya-orange font-mono">/rider/login</code>
        </div>
      </div>

      {/* Rider Grid Cards */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Truck className="h-8 w-8 text-kaya-orange animate-bounce mx-auto" />
          <p className="text-xs font-bold text-slate-400">Loading Fleet Accounts...</p>
        </div>
      ) : filteredRiders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 text-center space-y-4">
          <Truck className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Riders Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No dispatch rider accounts match your search query or no riders have been added yet.
          </p>
          <button
            onClick={openAddForm}
            className="bg-kaya-orange hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Rider Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRiders.map((r) => (
            <div 
              key={r.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
            >
              
              {/* Card Header Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={r.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.riderId}`}
                      alt={r.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-kaya-orange"
                    />
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">{r.fullName}</h3>
                      <p className="text-xs font-bold text-kaya-orange tracking-wide">{r.riderId}</p>
                      {r.username && (
                        <p className="text-[10px] text-slate-400 font-mono">@{r.username}</p>
                      )}
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    r.status === "ACTIVE" 
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50" 
                      : r.status === "SUSPENDED"
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                  }`}>
                    {r.status}
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-955 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px]">
                      <Truck className="h-3.5 w-3.5 text-kaya-orange" /> Vehicle
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{r.vehicleType} ({r.vehicleRegistration})</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[10px]">
                      <Phone className="h-3.5 w-3.5 text-kaya-orange" /> Phone
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{r.phoneNumber}</span>
                  </div>
                </div>

                {/* Performance Rating Trigger Button */}
                <button
                  onClick={() => setPerformanceRider(r)}
                  className="w-full bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 text-kaya-orange border border-orange-200 dark:border-orange-900/40 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Award className="h-4 w-4" />
                  <span>Audit Performance & Admin Remarks</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setViewRider(r)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Profile
                  </button>
                  <button
                    onClick={() => openEditForm(r)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleResetPassword(r.id)}
                    className="bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 text-kaya-orange font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-colors border border-orange-200 dark:border-orange-900/40"
                  >
                    <Key className="h-3.5 w-3.5" /> Credentials
                  </button>

                  {r.status === "SUSPENDED" ? (
                    <button
                      onClick={() => handleToggleStatus(r.id, "ACTIVE")}
                      className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-colors border border-emerald-200"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(r.id, "SUSPENDED")}
                      className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1 transition-colors border border-rose-200"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" /> Suspend
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(r.id)}
                  className="w-full text-slate-400 hover:text-rose-600 text-[10px] font-bold py-1 transition-colors text-center"
                >
                  Delete Rider Account
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Rider Performance Audit Modal */}
      {performanceRider && (
        <RiderPerformanceModal
          isOpen={!!performanceRider}
          onClose={() => setPerformanceRider(null)}
          rider={performanceRider}
        />
      )}

      {/* Add / Edit Rider Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingRider ? "Edit Rider Account" : "Add New Dispatch Rider"}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingRider ? "Update rider details & fleet status" : "System will automatically generate login credentials"}
                </p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >✕</button>
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
                    placeholder="e.g. John Doe"
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
                  <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Emergency Contact (Optional)</label>
                  <input 
                    type="text" 
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+234 803 111 2233 (Next of Kin)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="OFFLINE">Inactive / Offline</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Residential Address</label>
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
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Upload Profile Picture</label>
                <ImageUploader 
                  onUpload={(url) => setProfilePhoto(url)} 
                  defaultImage={profilePhoto}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Notes (Optional)</label>
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
                {submitting ? "Saving Rider..." : editingRider ? "Update Rider Profile" : "Create Rider & Generate Credentials"}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Generated Login Credentials Modal */}
      {credentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="bg-orange-50 dark:bg-orange-950/40 text-kaya-orange p-3.5 rounded-full w-fit mx-auto border border-orange-200 dark:border-orange-900/50">
                <Key className="h-8 w-8 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Generated Rider Credentials</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please securely share these login credentials with <strong className="text-slate-900 dark:text-white">{credentialsModal.fullName}</strong>.
              </p>
            </div>

            {/* Credentials Card Box */}
            <div className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Rider ID</span>
                <span className="font-black text-kaya-orange text-sm">{credentialsModal.riderId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Username</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{credentialsModal.username}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Email</span>
                <span className="font-bold text-slate-900 dark:text-white">{credentialsModal.email}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Temp Password</span>
                <span className="font-black text-rose-600 dark:text-rose-400 text-sm font-mono tracking-wider">{credentialsModal.tempPassword}</span>
              </div>
            </div>

            {/* Notification alert */}
            {copySuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-600 p-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Credentials copied to clipboard!
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyCredentials}
                  className="bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Copy className="h-4 w-4" /> Copy Info
                </button>
                <button
                  onClick={handlePrintCredentials}
                  className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Printer className="h-4 w-4" /> Print / Save
                </button>
              </div>

              <button
                onClick={() => handleResetPassword(credentialsModal.riderDbId)}
                disabled={regenerating}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} /> 
                Regenerate Temporary Password
              </button>

              <button
                onClick={() => setCredentialsModal(null)}
                className="w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold py-2 transition-colors text-center"
              >
                Close Window
              </button>
            </div>

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
                  {viewRider.username && (
                    <p className="text-[10px] text-slate-400 font-mono">@{viewRider.username}</p>
                  )}
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
