"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  User, ShoppingBag, Heart, MapPin, Plus, LogOut, CheckCircle2, 
  Package, Truck, Home, Phone, ShieldCheck, Clock, Check, FileText
} from "lucide-react";
import Link from "next/link";
import { confirmDeliveryByCustomer } from "@/app/actions/orderActions";
import DigitalSignatureModal from "@/components/DigitalSignatureModal";
import OrderProofModal from "@/components/OrderProofModal";

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Tab state: 'orders' | 'wishlist' | 'addresses' | 'profile'
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');

  // Customer orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address state
  const [addresses, setAddresses] = useState<any[]>([
    { id: "addr-1", street: "12, Admiralty Way, Lekki Phase 1", city: "Lekki", state: "Lagos", isDefault: true }
  ]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Wishlist state
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Signature modal state
  const [signatureOrder, setSignatureOrder] = useState<any>(null);

  // Proof modal state
  const [proofOrder, setProofOrder] = useState<any>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCustomerOrders();

      // Realtime polling sync every 4 seconds
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
      ORDER_PLACED: 0,
      Pending: 0,
      ORDER_CONFIRMED: 1,
      PREPARING: 2,
      Preparing: 2,
      PACKED: 3,
      ASSIGNED_TO_RIDER: 4,
      OUT_FOR_DELIVERY: 5,
      "Out for Delivery": 5,
      ARRIVING_SOON: 6,
      DELIVERED: 7,
      Delivered: 7,
      COMPLETED: 8,
    };
    return map[status] ?? 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-[#111111] dark:text-slate-100 font-sans">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Customer Portal</span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">My Account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Hello, <strong className="text-slate-900 dark:text-white">{user.name}</strong> — Track live order dispatches and manage your delivery addresses
          </p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-bold text-xs uppercase tracking-wider focus:outline-none border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-4.5 py-2.5 rounded-2xl transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="bg-slate-100/70 dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 h-fit space-y-2">
          {[
            { id: "orders", label: "My Orders", icon: ShoppingBag },
            { id: "wishlist", label: "Wishlist", icon: Heart },
            { id: "addresses", label: "Address Book", icon: MapPin },
            { id: "profile", label: "Profile Details", icon: User }
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

        {/* Dynamic content box */}
        <div className="lg:col-span-3">
          
          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Order Tracking & History</h2>
                <span className="text-xs text-slate-400 font-bold">Real-time Sync Active</span>
              </div>
              
              {orders.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-16 text-center border border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-full w-fit mx-auto shadow-sm">
                    <ShoppingBag className="h-10 w-10 text-kaya-orange" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">No orders placed yet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Explore fresh parboiled rice, tubers, and vegetables, and place your first order today!
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
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TOTAL PAID</p>
                            <p className="text-base font-black text-slate-900 dark:text-white">{formatPrice(order.totalAmount || order.total)}</p>
                          </div>
                          <div>
                            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              order.status === "COMPLETED" ? "bg-green-50 dark:bg-green-950/40 text-emerald-600 dark:text-emerald-400 border border-green-200 dark:border-green-900/40" :
                              order.status === "DELIVERED" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 animate-pulse" :
                              order.status === "CANCELLED" ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40" : 
                              "bg-orange-50 dark:bg-orange-950/40 text-kaya-orange border border-orange-200 dark:border-orange-900/40"
                            }`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Customer Confirmation Action Card (Requirements 8 & 9) */}
                        {isDeliveredWaitingConfirmation && (
                          <div className="bg-gradient-to-r from-orange-500 to-kaya-orange text-white p-6 rounded-3xl shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-3">
                              <ShieldCheck className="h-8 w-8 text-white shrink-0" />
                              <div>
                                <h4 className="font-black text-base">Rider Has Marked Package as Delivered!</h4>
                                <p className="text-xs opacity-90">Please confirm receipt and provide digital proof of delivery to finalize your order.</p>
                              </div>
                            </div>

                            <button
                              onClick={() => setSignatureOrder(order)}
                              className="w-full bg-white text-slate-950 hover:bg-slate-100 font-extrabold py-3.5 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="h-4.5 w-4.5 text-kaya-orange" />
                              <span>Confirm Receipt & Sign Delivery Proof</span>
                            </button>
                          </div>
                        )}

                        {/* Completed Proof Badge */}
                        {isCompleted && order.signatureData && (
                          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-2xl">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-4.5 w-4.5" />
                              <span>Delivery Confirmed & Verified with Digital Signature</span>
                            </div>
                            <button
                              onClick={() => setProofOrder(order)}
                              className="text-xs font-bold text-kaya-orange hover:text-orange-600 flex items-center gap-1"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>View Proof</span>
                            </button>
                          </div>
                        )}

                        {/* Assigned Rider Info Card */}
                        {order.rider && (
                          <div className="bg-slate-50 dark:bg-slate-955 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={order.rider.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.rider.riderId}`}
                                alt={order.rider.fullName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-kaya-orange"
                              />
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">ASSIGNED DISPATCH RIDER</p>
                                <p className="text-xs font-extrabold text-slate-900 dark:text-white">{order.rider.fullName}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{order.rider.vehicleType} ({order.rider.vehicleRegistration})</p>
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

                        {/* Full 9-Stage Progress Timeline */}
                        <div className="bg-slate-50 dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Live Delivery Pipeline Progress
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

                        {/* Items list */}
                        <div className="space-y-3 pt-2">
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white">Items in Package:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                                <span className="font-bold text-slate-800 dark:text-slate-200">{item.productName}</span>
                                <span className="font-black text-kaya-orange">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">My Saved Wishlist</h2>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-16 text-center border border-slate-200 dark:border-slate-800 space-y-4">
                <Heart className="h-10 w-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Your wishlist is currently empty</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Save your favorite grocery items to your wishlist for quick re-ordering anytime!
                </p>
                <Link href="/products" className="inline-block bg-kaya-orange hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition-all">
                  Browse Shop
                </Link>
              </div>
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
                <form onSubmit={handleAddAddress} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top duration-300">
                  <h3 className="font-bold text-xs text-slate-600 dark:text-slate-300 uppercase">New Address Details</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Street Address</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. 12 Admiralty Way, Lekki Phase 1" 
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
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
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
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
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
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

          {/* PROFILE DETAILS TAB */}
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Profile Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">{user.name}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">{user.email}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">{user.phone || "Not Specified"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Role</p>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-white">{user.role}</p>
                </div>
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

    </div>
  );
}
