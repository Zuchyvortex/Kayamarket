"use client";

import React, { useState, useEffect } from "react";
import { 
  Truck, CheckCircle, Clock, MapPin, Phone, User, Package, 
  ChevronRight, Navigation, ShieldCheck, DollarSign, AlertCircle, FileText, Check
} from "lucide-react";
import { updateOrderStatus } from "@/app/actions/orderActions";
import OrderProofModal from "@/components/OrderProofModal";

export default function RiderDashboardPage() {
  const [rider, setRider] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ASSIGNED" | "COMPLETED">("ASSIGNED");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedMapOrder, setSelectedMapOrder] = useState<any>(null);
  const [proofOrder, setProofOrder] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kayamarket_rider_session");
    if (saved) {
      setRider(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!rider) return;
    fetchRiderDeliveries();
    
    // Auto sync real-time every 4 seconds
    const interval = setInterval(fetchRiderDeliveries, 4000);
    return () => clearInterval(interval);
  }, [rider]);

  const fetchRiderDeliveries = async () => {
    if (!rider) return;
    try {
      const res = await fetch(`/api/sync?role=RIDER&riderId=${rider.id}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: any, stageLabel: string) => {
    setUpdatingId(orderId);
    try {
      const result = await updateOrderStatus(
        orderId, 
        newStatus, 
        `Rider (${rider.fullName})`,
        `Rider updated stage to ${stageLabel}`
      );

      if (result.success) {
        // Refresh local orders
        await fetchRiderDeliveries();
      } else {
        alert(result.error || "Failed to update delivery status.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const assignedOrders = orders.filter(o => o.status !== "COMPLETED" && o.status !== "CANCELLED");
  const completedOrders = orders.filter(o => o.status === "COMPLETED");

  const totalEarningsEstimate = completedOrders.length * 2000;

  if (loading && !rider) {
    return (
      <div className="py-20 text-center space-y-4">
        <Truck className="h-10 w-10 text-kaya-orange animate-bounce mx-auto" />
        <p className="text-sm font-bold text-slate-500">Loading Assigned Deliveries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner & Stats Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">
              Live Fleet Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {rider?.fullName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Assigned Vehicle: <strong className="text-slate-800 dark:text-slate-200">{rider?.vehicleType} ({rider?.vehicleRegistration})</strong>
          </p>
        </div>

        {/* Quick Earnings & Stats Cards */}
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 p-4 rounded-2xl text-center min-w-[130px]">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Active Tasks</p>
            <p className="text-2xl font-black text-kaya-orange">{assignedOrders.length}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl text-center min-w-[130px]">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Est. Earnings</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(totalEarningsEstimate)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab("ASSIGNED")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "ASSIGNED"
              ? "bg-white dark:bg-slate-800 text-kaya-orange shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Assigned Deliveries ({assignedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "COMPLETED"
              ? "bg-white dark:bg-slate-800 text-kaya-orange shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          <span>Completed History ({completedOrders.length})</span>
        </button>
      </div>

      {/* ASSIGNED DELIVERIES */}
      {activeTab === "ASSIGNED" && (
        <div className="space-y-6">
          {assignedOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-16 text-center border border-slate-200 dark:border-slate-800 space-y-4">
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No active deliveries assigned right now</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                When administrators assign new order dispatches to your rider ID, they will appear here immediately.
              </p>
            </div>
          ) : (
            assignedOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow"
              >
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-black uppercase text-kaya-orange tracking-widest">ORDER NUMBER</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{order.orderNumber}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                      order.status === "DELIVERED" ? "bg-green-50 dark:bg-green-950/30 text-emerald-600 dark:text-emerald-400 border-green-200" :
                      order.status === "OUT_FOR_DELIVERY" ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200" :
                      "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200"
                    }`}>
                      Stage: {order.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => setSelectedMapOrder(order)}
                      className="px-4 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-kaya-orange border border-orange-200 dark:border-orange-900/40 font-bold text-xs flex items-center gap-1.5 hover:bg-orange-100 transition-all"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>View Route Map</span>
                    </button>
                  </div>
                </div>

                {/* Customer Details & Delivery Address & Call Action Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-955 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Details & Quick Call</p>
                    <div className="space-y-1">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <User className="h-4 w-4 text-kaya-orange" />
                        <span>{order.customerName}</span>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>Primary Phone: {order.customerPhone || "Not provided"}</span>
                      </p>
                      {(order.customerAltPhone || order.user?.altPhoneNumber) && (
                        <p className="text-xs text-kaya-orange font-bold flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-kaya-orange" />
                          <span>Alt Phone: {order.customerAltPhone || order.user?.altPhoneNumber}</span>
                        </p>
                      )}
                    </div>

                    {/* Quick Call Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.customerPhone && (
                        <a 
                          href={`tel:${order.customerPhone}`}
                          className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>Call Primary Phone</span>
                        </a>
                      )}
                      {(order.customerAltPhone || order.user?.altPhoneNumber) && (
                        <a 
                          href={`tel:${order.customerAltPhone || order.user?.altPhoneNumber}`}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 shadow-sm transition-all"
                        >
                          <Phone className="h-3.5 w-3.5 text-kaya-orange" />
                          <span>Call Alt Phone</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination Address & Notes</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-kaya-orange shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress}</span>
                    </p>
                    {order.deliveryDate && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold pl-6">
                        Scheduled: {order.deliveryDate} ({order.deliveryTime || "Anytime"})
                      </p>
                    )}
                    {order.notes && (
                      <p className="text-[11px] text-orange-600 dark:text-orange-400 font-bold pl-6">
                        Delivery Notes: {order.notes}
                      </p>
                    )}
                    <p className="text-[10px] font-bold text-slate-400 pl-6 uppercase">
                      Payment Method: <span className="text-slate-900 dark:text-white">{order.paymentMethod || "Bank Transfer"} ({order.paymentStatus || "PAID"})</span>
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white">Package Contents:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.productName}</span>
                        <span className="font-black text-kaya-orange bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Buttons Row */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Update Delivery Stage (Instant Customer & Admin Sync):
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <button
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusUpdate(order.id, "ORDER_CONFIRMED", "Confirmed")}
                      className={`py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                        order.status === "ORDER_CONFIRMED"
                          ? "bg-kaya-orange text-white border-kaya-orange shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-kaya-orange border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <span>1. Accept Delivery</span>
                    </button>

                    <button
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusUpdate(order.id, "PACKED", "Picked Up Package")}
                      className={`py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                        order.status === "PACKED"
                          ? "bg-kaya-orange text-white border-kaya-orange shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-kaya-orange border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <span>2. Picked Up</span>
                    </button>

                    <button
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusUpdate(order.id, "OUT_FOR_DELIVERY", "Out for Delivery")}
                      className={`py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                        order.status === "OUT_FOR_DELIVERY"
                          ? "bg-kaya-orange text-white border-kaya-orange shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-kaya-orange border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <span>3. Out for Delivery</span>
                    </button>

                    <button
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusUpdate(order.id, "ARRIVING_SOON", "Arriving Soon")}
                      className={`py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                        order.status === "ARRIVING_SOON"
                          ? "bg-kaya-orange text-white border-kaya-orange shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-kaya-orange border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <span>4. Arriving Soon</span>
                    </button>

                    <button
                      disabled={updatingId === order.id}
                      onClick={() => handleStatusUpdate(order.id, "DELIVERED", "Delivered")}
                      className={`py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 border col-span-2 sm:col-span-1 ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-200 dark:border-emerald-900/40"
                      }`}
                    >
                      <span>5. Delivered ✓</span>
                    </button>
                  </div>
                </div>

                {order.status === "DELIVERED" && !order.customerConfirmed && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-bold">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500 animate-spin" />
                      Waiting for Customer Receipt Confirmation & Digital Signature...
                    </span>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 rounded-full uppercase">
                      Delivered Stage
                    </span>
                  </div>
                )}

              </div>
            ))
          )}
        </div>
      )}

      {/* COMPLETED DELIVERIES HISTORY */}
      {activeTab === "COMPLETED" && (
        <div className="space-y-6">
          {completedOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-16 text-center border border-slate-200 dark:border-slate-800 space-y-4">
              <CheckCircle className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No completed delivery history yet</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                Completed orders with customer signatures will be recorded here.
              </p>
            </div>
          ) : (
            completedOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">
                      COMPLETED & VERIFIED
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{order.orderNumber}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{order.customerName} • {order.deliveryAddress}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatPrice(order.totalAmount)}
                    </span>
                    <button
                      onClick={() => setProofOrder(order)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-kaya-orange" />
                      <span>View Proof</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>Confirmed Date: {order.confirmedAt ? new Date(order.confirmedAt).toLocaleString() : "Confirmed"}</span>
                  <span className="text-emerald-600 font-bold">Payout Credit: ₦2,000</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Interactive Map Route Modal */}
      {selectedMapOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-kaya-orange" />
                  <span>GPS Delivery Route Navigation</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Order <strong className="text-slate-900 dark:text-white">{selectedMapOrder.orderNumber}</strong> • {selectedMapOrder.customerName}
                </p>
              </div>
              <button 
                onClick={() => setSelectedMapOrder(null)} 
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Map visual mock container */}
            <div className="bg-slate-950 rounded-2xl h-64 relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#FF7A1A_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="relative z-10 text-center space-y-4 p-6">
                <div className="flex justify-center items-center gap-8">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-orange-500 flex items-center justify-center mx-auto text-orange-400">
                      <Truck className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 mt-1 block">Kaya Warehouse</span>
                  </div>

                  <div className="flex-1 h-0.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-emerald-500 border-t border-dashed"></div>

                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 mt-1 block">Customer Destination</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-xs text-slate-200">
                  Destination: <strong className="text-white">{selectedMapOrder.deliveryAddress}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedMapOrder(null)}
              className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3 rounded-2xl text-xs shadow-md"
            >
              Close Navigation Window
            </button>
          </div>
        </div>
      )}

      {/* Proof Viewer Modal */}
      <OrderProofModal
        isOpen={!!proofOrder}
        onClose={() => setProofOrder(null)}
        order={proofOrder}
      />

    </div>
  );
}
