"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  User, ShoppingBag, Heart, MapPin, Plus, LogOut, CheckCircle2, 
  Package, Truck, Phone, ShieldCheck, Clock, Check, FileText, Star,
  Camera, Lock, Save, Printer
} from "lucide-react";
import Link from "next/link";
import { confirmDeliveryByCustomer } from "@/app/actions/orderActions";
import { updateCustomerProfile } from "@/app/actions/customerActions";
import DigitalSignatureModal from "@/components/DigitalSignatureModal";
import OrderProofModal from "@/components/OrderProofModal";
import InvoiceModal from "@/components/InvoiceModal";
import ProductReviewModal from "@/components/ProductReviewModal";
import RiderReviewModal from "@/components/RiderReviewModal";

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Tab state: 'orders' | 'wishlist' | 'addresses' | 'profile' | 'invoices'
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile' | 'invoices'>('orders');

  // Customer orders & profile state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCity, setProfileCity] = useState("Lagos");
  const [profileState, setProfileState] = useState("Lagos");
  const [profileImage, setProfileImage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Modals state
  const [signatureOrder, setSignatureOrder] = useState<any>(null);
  const [proofOrder, setProofOrder] = useState<any>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);
  const [reviewProductModal, setReviewProductModal] = useState<{ isOpen: boolean; productId: string; productName: string } | null>(null);
  const [reviewRiderModal, setReviewRiderModal] = useState<{ isOpen: boolean; orderId: string; orderNumber: string; riderName: string } | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<any[]>([
    { id: "addr-1", street: "12, Admiralty Way, Lekki Phase 1", city: "Lekki", state: "Lagos", isDefault: true }
  ]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      const parts = (user.name || "").trim().split(/\s+/);
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      fetchCustomerOrders();

      const interval = setInterval(fetchCustomerOrders, 4000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchCustomerOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/sync?role=CUSTOMER&userId=${user.id}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const res = await updateCustomerProfile(user.id, {
        firstName,
        lastName,
        email,
        username,
        phoneNumber: phone,
        altPhoneNumber: altPhone,
        address: profileAddress,
        city: profileCity,
        state: profileState,
        profileImage: profileImage || undefined,
        password: newPassword.trim() || undefined
      });

      if (res.success) {
        alert("Profile updated successfully!");
        setNewPassword("");
      } else {
        alert(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (street && city && state) {
      const newAddr = { id: `addr-${Date.now()}`, street, city, state, isDefault: addresses.length === 0 };
      setAddresses([...addresses, newAddr]);
      setStreet("");
      setCity("");
      setState("");
      setShowAddressForm(false);
    }
  };

  const handleConfirmProof = async (proof: {
    signatureType: "DRAWN" | "TYPED";
    signatureData: string;
    proofCustomerName: string;
  }) => {
    if (!signatureOrder) return;
    const result = await confirmDeliveryByCustomer({
      orderId: signatureOrder.id,
      ...proof
    });

    if (result.success) {
      await fetchCustomerOrders();
      setSignatureOrder(null);
    } else {
      alert(result.error || "Failed to confirm delivery.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  if (!user) return null;

  const trackingStages = [
    { key: "ORDER_PLACED", label: "Order Placed" },
    { key: "ORDER_CONFIRMED", label: "Confirmed" },
    { key: "PREPARING", label: "Preparing" },
    { key: "PACKED", label: "Packed" },
    { key: "ASSIGNED_TO_RIDER", label: "Rider Assigned" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "ARRIVING_SOON", label: "Arriving Soon" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "COMPLETED", label: "Completed" }
  ];

  const getStageIndex = (status: string) => {
    const map: Record<string, number> = {
      ORDER_PLACED: 0, Pending: 0, ORDER_CONFIRMED: 1, PREPARING: 2,
      Preparing: 2, PACKED: 3, ASSIGNED_TO_RIDER: 4, OUT_FOR_DELIVERY: 5,
      "Out for Delivery": 5, ARRIVING_SOON: 6, DELIVERED: 7, Delivered: 7, COMPLETED: 8
    };
    return map[status] ?? 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
              alt={user.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-kaya-orange shadow-md"
            />
          </div>
          <div>
            <span className="text-kaya-orange font-black text-xs uppercase tracking-widest">CUSTOMER SELF-SERVICE</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">Welcome, {user.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Live tracking, profile management, PDF invoicing, and rider ratings.
            </p>
          </div>
        </div>

        <button 
          onClick={logout}
          className="flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-bold text-xs uppercase tracking-wider focus:outline-none border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-4.5 py-2.5 rounded-2xl transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="bg-slate-100/70 dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 h-fit space-y-2">
          {[
            { id: "orders", label: "My Orders & Tracking", icon: ShoppingBag },
            { id: "invoices", label: "My PDF Invoices", icon: FileText },
            { id: "profile", label: "Profile & Photo Upload", icon: User },
            { id: "addresses", label: "Saved Delivery Address", icon: MapPin },
            { id: "wishlist", label: "Saved Wishlist", icon: Heart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-4.5 py-3.5 rounded-2xl text-xs font-bold transition-all text-left focus:outline-none ${
                activeTab === tab.id 
                  ? "bg-slate-900 dark:bg-kaya-orange text-white shadow-md" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
              }`}
            >
              <tab.icon className="h-4.5 w-4.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Content Panel */}
        <div className="lg:col-span-3">
          
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Live Orders & Logistics Dispatch</h2>
                <span className="text-xs text-slate-400 font-bold">Auto-Polling Active</span>
              </div>
              
              {orders.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-16 text-center border border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-full w-fit mx-auto shadow-sm">
                    <ShoppingBag className="h-10 w-10 text-kaya-orange" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">No active orders</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Explore fresh food baskets and place your order today!
                    </p>
                  </div>
                  <Link href="/products" className="inline-block bg-kaya-orange hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-2xl text-xs shadow-md transition-all">
                    Browse Store Catalog
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const currentStageIdx = getStageIndex(order.status);
                    const isDeliveredWaitingConfirmation = order.status === "DELIVERED" && !order.customerConfirmed;
                    const isCompleted = order.status === "COMPLETED";

                    return (
                      <div 
                        key={order.id} 
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ORDER NUMBER</p>
                            <p className="text-base font-black text-slate-900 dark:text-white">{order.orderNumber}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TOTAL AMOUNT</p>
                            <p className="text-base font-black text-slate-900 dark:text-white">{formatPrice(order.totalAmount || order.total)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              order.status === "COMPLETED" ? "bg-green-50 dark:bg-green-950/40 text-emerald-600 dark:text-emerald-400 border border-green-200 dark:border-green-900/40" :
                              order.status === "DELIVERED" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 animate-pulse" :
                              order.status === "CANCELLED" ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40" : 
                              "bg-orange-50 dark:bg-orange-950/40 text-kaya-orange border border-orange-200 dark:border-orange-900/40"
                            }`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>

                            {/* PDF Invoice Trigger (Requirement 6) */}
                            {(order.status === "DELIVERED" || order.status === "COMPLETED") && (
                              <button
                                onClick={() => setInvoiceOrder(order)}
                                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all"
                              >
                                <FileText className="h-3.5 w-3.5 text-kaya-orange" />
                                <span>PDF Invoice</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Customer Confirmation Action Card */}
                        {isDeliveredWaitingConfirmation && (
                          <div className="bg-gradient-to-r from-orange-500 to-kaya-orange text-white p-6 rounded-3xl shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-3">
                              <ShieldCheck className="h-8 w-8 text-white shrink-0" />
                              <div>
                                <h4 className="font-black text-base">Rider Delivered Package!</h4>
                                <p className="text-xs opacity-90">Please confirm receipt and sign digital proof to complete order.</p>
                              </div>
                            </div>

                            <button
                              onClick={() => setSignatureOrder(order)}
                              className="w-full bg-white text-slate-950 hover:bg-slate-100 font-extrabold py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="h-4.5 w-4.5 text-kaya-orange" />
                              <span>Confirm Receipt & Sign Delivery Proof</span>
                            </button>
                          </div>
                        )}

                        {/* Completed Proof & Review Options */}
                        {(isCompleted || order.status === "DELIVERED") && (
                          <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-2xl">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-4.5 w-4.5" />
                              <span>Delivery Verified</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {order.rider && (
                                <button
                                  onClick={() => setReviewRiderModal({
                                    isOpen: true,
                                    orderId: order.id,
                                    orderNumber: order.orderNumber,
                                    riderName: order.rider.fullName
                                  })}
                                  className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                                >
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  <span>Rate Rider</span>
                                </button>
                              )}

                              {order.items?.[0]?.productId && (
                                <button
                                  onClick={() => setReviewProductModal({
                                    isOpen: true,
                                    productId: order.items[0].productId,
                                    productName: order.items[0].productName
                                  })}
                                  className="bg-kaya-orange text-white font-bold px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1 hover:bg-orange-600 transition-colors shadow-sm"
                                >
                                  <Star className="h-3 w-3 fill-white text-white" />
                                  <span>Rate Product</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Assigned Rider Info Card */}
                        {order.rider && (
                          <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={order.rider.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.rider.riderId}`}
                                alt={order.rider.fullName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-kaya-orange"
                              />
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">DISPATCH RIDER</p>
                                <p className="text-xs font-extrabold text-slate-900 dark:text-white">{order.rider.fullName}</p>
                                <p className="text-[10px] text-slate-500 font-semibold">{order.rider.vehicleType} ({order.rider.vehicleRegistration})</p>
                              </div>
                            </div>

                            <a 
                              href={`tel:${order.rider.phoneNumber}`}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-kaya-orange border border-orange-200 dark:border-orange-900/40 font-bold text-xs hover:bg-orange-100 transition-colors"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Call Rider ({order.rider.phoneNumber})</span>
                            </a>
                          </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-slate-50 dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Order Status Progress
                          </p>

                          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-center text-[10px] font-bold">
                            {trackingStages.map((stage, idx) => {
                              const isCompletedStep = idx <= currentStageIdx;
                              const isCurrentStep = idx === currentStageIdx;

                              return (
                                <div key={stage.key} className="flex flex-col items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    isCompletedStep 
                                      ? "bg-kaya-orange text-white shadow-sm" 
                                      : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                  } ${isCurrentStep ? "ring-4 ring-orange-100 dark:ring-orange-950 scale-110" : ""}`}>
                                    {isCompletedStep ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                                  </div>
                                  <span className={`text-[9px] leading-tight ${
                                    isCompletedStep ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-400 dark:text-slate-600"
                                  }`}>
                                    {stage.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* INVOICES TAB (Requirement 6 & 7) */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Automated Order Invoices</h2>
              {orders.filter(o => o.status === "DELIVERED" || o.status === "COMPLETED").length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-16 text-center border border-slate-200 dark:border-slate-800 space-y-4">
                  <FileText className="h-10 w-10 text-slate-400 mx-auto" />
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white">No invoices generated yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Invoices are automatically created upon successful order delivery.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {orders.filter(o => o.status === "DELIVERED" || o.status === "COMPLETED").map(ord => (
                    <div key={ord.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-kaya-orange">OFFICIAL INVOICE</span>
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white">Order #{ord.orderNumber}</p>
                        <p className="text-xs text-slate-500">{formatPrice(ord.totalAmount)} • Paid</p>
                      </div>
                      <button
                        onClick={() => setInvoiceOrder(ord)}
                        className="bg-kaya-orange hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print Invoice</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE EDIT TAB (Requirement 2 & 10) */}
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm">
              <div>
                <span className="text-kaya-orange font-black text-xs uppercase tracking-widest">SELF-SERVICE EDITING</span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">Manage Profile & Image</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update personal details, upload photo, or change password.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
                
                {/* Profile Photo Upload */}
                <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-955 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="relative group">
                    <img 
                      src={profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-kaya-orange shadow-md"
                    />
                    <label className="absolute bottom-0 right-0 bg-slate-900 text-white p-1.5 rounded-full cursor-pointer hover:scale-110 transition-transform">
                      <Camera className="h-3.5 w-3.5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Profile Photo</h4>
                    <p className="text-[11px] text-slate-500">Upload JPEG, PNG or SVG file for your customer avatar.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">First Name</label>
                    <input 
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Last Name</label>
                    <input 
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Username (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g., chinedu_kaya"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Primary Phone</label>
                    <input 
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Alternative Phone</label>
                    <input 
                      type="tel"
                      placeholder="e.g. +234 809 999 8888"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">Default Delivery Address</label>
                    <input 
                      type="text"
                      placeholder="12 Admiralty Way, Lekki Phase 1"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">City</label>
                    <input 
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">State</label>
                    <input 
                      type="text"
                      value={profileState}
                      onChange={(e) => setProfileState(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="font-bold text-slate-400 uppercase text-[10px]">New Password (Leave blank to keep unchanged)</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md transition-all flex items-center gap-2 text-xs"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingProfile ? "Saving Profile..." : "Save Profile Details"}</span>
                </button>
              </form>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Saved Delivery Addresses</h2>
                <button 
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="bg-kaya-orange hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h3 className="font-bold text-xs text-slate-600 dark:text-slate-300 uppercase">New Address Details</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Street Address</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. 12 Admiralty Way, Lekki Phase 1" 
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">City</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Lekki" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">State</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Lagos" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-kaya-orange text-white text-xs font-bold rounded-xl shadow-md">
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-sm">
                    <div>
                      <div className="flex justify-between items-start">
                        <MapPin className="h-5 w-5 text-kaya-orange" />
                        {addr.isDefault && (
                          <span className="text-[9px] bg-orange-100 dark:bg-orange-950/40 text-kaya-orange px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-4">{addr.street}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{addr.city}, {addr.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">My Saved Wishlist</h2>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-16 text-center border border-slate-200 dark:border-slate-800 space-y-4">
                <Heart className="h-10 w-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Your wishlist is currently empty</h3>
                <Link href="/products" className="inline-block bg-kaya-orange hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition-all">
                  Browse Shop
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Signature Modal */}
      {signatureOrder && (
        <DigitalSignatureModal
          isOpen={!!signatureOrder}
          onClose={() => setSignatureOrder(null)}
          orderNumber={signatureOrder.orderNumber}
          customerDefaultName={user.name}
          onSubmitProof={handleConfirmProof}
        />
      )}

      {/* Proof Modal */}
      <OrderProofModal
        isOpen={!!proofOrder}
        onClose={() => setProofOrder(null)}
        order={proofOrder}
      />

      {/* Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          order={invoiceOrder}
        />
      )}

      {/* Product Review Modal */}
      {reviewProductModal && (
        <ProductReviewModal
          isOpen={reviewProductModal.isOpen}
          onClose={() => setReviewProductModal(null)}
          productId={reviewProductModal.productId}
          productName={reviewProductModal.productName}
          userId={user.id}
          userName={user.name}
        />
      )}

      {/* Rider Review Modal */}
      {reviewRiderModal && (
        <RiderReviewModal
          isOpen={reviewRiderModal.isOpen}
          onClose={() => setReviewRiderModal(null)}
          orderId={reviewRiderModal.orderId}
          orderNumber={reviewRiderModal.orderNumber}
          riderName={reviewRiderModal.riderName}
          userId={user.id}
        />
      )}

    </div>
  );
}
