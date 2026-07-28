"use client";

import React, { useState, useEffect } from "react";
import { 
  Truck, CheckCircle, Clock, MapPin, Phone, User, Package, 
  ChevronRight, Navigation, ShieldCheck, DollarSign, AlertCircle, FileText, Check,
  Star, Award, MessageSquare, ThumbsUp
} from "lucide-react";
import { updateOrderStatus } from "@/app/actions/orderActions";
import { getRiderFeedbackAndRemarks } from "@/app/actions/riderActions";
import OrderProofModal from "@/components/OrderProofModal";

export default function RiderDashboardPage() {
  const [rider, setRider] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ASSIGNED" | "COMPLETED" | "PERFORMANCE">("ASSIGNED");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedMapOrder, setSelectedMapOrder] = useState<any>(null);
  const [proofOrder, setProofOrder] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kayamarket_rider_session");
    if (saved) {
      setRider(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!rider) return;
    fetchRiderDeliveries();
    fetchRiderFeedback();
    
    // Auto sync real-time every 4 seconds
    const interval = setInterval(() => {
      fetchRiderDeliveries();
      fetchRiderFeedback();
    }, 4000);
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

  const fetchRiderFeedback = async () => {
    if (!rider) return;
    try {
      const res = await getRiderFeedbackAndRemarks(rider.id);
      if (res.success) {
        setFeedbackData(res);
      }
    } catch (e) {
      console.error("Error fetching feedback:", e);
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

        {/* Quick Earnings & Rating Cards */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 p-3.5 rounded-2xl text-center min-w-[110px]">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Tasks</p>
            <p className="text-xl font-black text-kaya-orange">{assignedOrders.length}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 p-3.5 rounded-2xl text-center min-w-[110px]">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Est. Earnings</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatPrice(totalEarningsEstimate)}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 p-3.5 rounded-2xl text-center min-w-[110px]">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rating</p>
            <p className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
              <span>{feedbackData?.avgRating || "5.0"}</span>
              <Star className="h-4 w-4 fill-amber-500" />
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl">
        <button
          onClick={() => setActiveTab("ASSIGNED")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "ASSIGNED"
              ? "bg-white dark:bg-slate-800 text-kaya-orange shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Assigned ({assignedOrders.length})</span>
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
          <span>Completed ({completedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PERFORMANCE")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "PERFORMANCE"
              ? "bg-white dark:bg-slate-800 text-kaya-orange shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Performance & Remarks</span>
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
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Customer & Address info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-955 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Details</p>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-kaya-orange shrink-0" />
                      <span className="font-bold text-slate-900 dark:text-white">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                      <a href={`tel:${order.customerPhone}`} className="font-semibold text-slate-700 dark:text-slate-300 hover:text-kaya-orange">
                        {order.customerPhone}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{order.deliveryAddress}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedMapOrder(order)}
                      className="text-kaya-orange hover:underline font-bold flex items-center gap-1 text-[11px] pt-1"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>View GPS Route Navigation</span>
                    </button>
                  </div>
                </div>

                {/* Status Update Pipeline */}
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Delivery Stage</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusUpdate(order.id, "PROCESSING", "In Packing / Assembly")}
                      disabled={updatingId === order.id || order.status === "PROCESSING"}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        order.status === "PROCESSING" 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Processing</span>
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(order.id, "OUT_FOR_DELIVERY", "Out For Express Delivery")}
                      disabled={updatingId === order.id || order.status === "OUT_FOR_DELIVERY"}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        order.status === "OUT_FOR_DELIVERY" 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Out for Delivery</span>
                    </button>

                    <button
                      onClick={() => handleStatusUpdate(order.id, "COMPLETED", "Delivery Complete")}
                      disabled={updatingId === order.id || order.status === "COMPLETED"}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border border-emerald-600"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Mark Delivered & Complete</span>
                    </button>
                  </div>
                </div>
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
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No completed deliveries yet</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                Completed dispatches will appear here alongside proof of delivery records.
              </p>
            </div>
          ) : (
            completedOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">COMPLETED DISPATCH</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{order.orderNumber}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{order.customerName} • {order.deliveryAddress}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.deliverySignatureUrl && (
                      <button 
                        onClick={() => setProofOrder(order)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                      >
                        <FileText className="h-3.5 w-3.5 text-kaya-orange" />
                        <span>View Proof</span>
                      </button>
                    )}
                    <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                      DELIVERED
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Completed: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "Recently"}</span>
                  <span className="text-emerald-600 font-bold">Rider Credit: ₦2,000</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PERFORMANCE & REMARKS TAB (Requirement 6) */}
      {activeTab === "PERFORMANCE" && (
        <div className="space-y-8">
          
          {/* Badge & Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-kaya-orange tracking-widest">OFFICIAL AUDIT BADGE</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{feedbackData?.performanceBadge || "Reliable Rider ⭐⭐⭐⭐"}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated based on customer ratings, on-time delivery rates, and compliance reviews.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-3xl border border-amber-200 dark:border-amber-900/40 text-center min-w-[160px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Score</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-3xl font-black text-amber-500">{feedbackData?.avgRating || "5.0"}</span>
                  <span className="text-sm font-bold text-slate-400">/ 5.0</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">({feedbackData?.totalReviews || 0} Ratings)</p>
              </div>
            </div>

            {/* Admin Private Remarks Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-kaya-orange" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Internal Administrative Remarks</h4>
              </div>

              {!feedbackData?.remarks || feedbackData.remarks.length === 0 ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-955 rounded-2xl text-center border border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  No administrative notes recorded yet. Keep up the great work!
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbackData.remarks.map((remark: any) => (
                    <div 
                      key={remark.id}
                      className={`p-4.5 rounded-2xl border text-xs space-y-1.5 ${
                        remark.type === "COMMENDATION" 
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-300"
                          : remark.type === "IMPROVEMENT"
                          ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-900 dark:text-amber-300"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/60 dark:bg-black/20">
                          {remark.type}
                        </span>
                        <span className="text-[10px] opacity-75 font-semibold">
                          {new Date(remark.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium leading-relaxed">{remark.content}</p>
                      <p className="text-[9px] opacity-70 italic">— Logged by {remark.createdBy}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Reviews Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-kaya-orange" />
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Customer Delivery Reviews</h4>
              </div>

              {!feedbackData?.reviews || feedbackData.reviews.length === 0 ? (
                <div className="p-6 bg-slate-50 dark:bg-slate-955 rounded-2xl text-center border border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  No customer ratings submitted yet for completed deliveries.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {feedbackData.reviews.map((rev: any) => (
                    <div 
                      key={rev.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {rev.user ? `${rev.user.firstName} ${rev.user.lastName}` : "Customer"}
                        </span>
                        <div className="flex text-amber-500">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-slate-600 dark:text-slate-400 italic">"{rev.comment}"</p>
                      )}
                      <p className="text-[10px] text-slate-400 pt-1">Order #{rev.order?.orderNumber || "Completed"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Interactive Map Route Modal */}
      {selectedMapOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm animate-in fade-in duration-200">
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

            <div className="bg-slate-955 rounded-2xl h-64 relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
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
                    <div className="w-10 h-10 rounded-full bg-emerald-955 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
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
