"use client";

import React, { useState, useEffect } from "react";
import { 
  ClipboardList, Search, Filter, Truck, User, Calendar, MapPin, 
  CheckCircle2, Clock, ChevronRight, Phone, Eye, FileText, ArrowRight, ShieldCheck
} from "lucide-react";
import { getOrders, updateOrderStatus, assignRiderToOrder } from "@/app/actions/orderActions";
import { getRiders } from "@/app/actions/riderActions";
import OrderProofModal from "@/components/OrderProofModal";

export default function AdminOrdersBoard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Selected Order for Proof Modal
  const [proofOrder, setProofOrder] = useState<any>(null);

  // Updating loader
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();

    // Auto polling real-time synchronization every 4 seconds
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [fetchedOrders, fetchedRiders] = await Promise.all([
        getOrders(),
        getRiders()
      ]);
      setOrders(fetchedOrders);
      setRiders(fetchedRiders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: any) => {
    setActionLoading(true);
    try {
      const result = await updateOrderStatus(orderId, newStatus, "Admin");
      if (result.success) {
        await loadData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(result.order);
        }
      } else {
        alert(result.error || "Failed to update status.");
      }
    } catch (err: any) {
      alert(err.message || "Error updating status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRider = async (orderId: string, riderId: string) => {
    if (!riderId) return;
    setActionLoading(true);
    try {
      const result = await assignRiderToOrder(orderId, riderId);
      if (result.success) {
        await loadData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(result.order);
        }
      } else {
        alert(result.error || "Failed to assign rider.");
      }
    } catch (err: any) {
      alert(err.message || "Error assigning rider.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
      o.deliveryAddress.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const availableRiders = riders.filter(r => r.status === "ACTIVE");

  return (
    <div className="space-y-8 bg-slate-50 dark:bg-slate-950 text-[#111111] dark:text-slate-100 font-sans pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Fulfillment & Logistics</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Order Management Console
          </h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs">
            Monitor incoming client orders, manually change stage pipelines, and assign available dispatch riders.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-kaya-orange animate-ping"></span>
          <span className="text-xs font-bold text-slate-800 dark:text-white">{orders.length} Total Orders</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Name, Phone..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
          {[
            { id: "ALL", label: "All Orders" },
            { id: "ORDER_PLACED", label: "New Incoming" },
            { id: "PREPARING", label: "Preparing" },
            { id: "ASSIGNED_TO_RIDER", label: "Assigned" },
            { id: "OUT_FOR_DELIVERY", label: "En Route" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "COMPLETED", label: "Completed" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-slate-900 dark:bg-kaya-orange text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-955 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 dark:bg-slate-955 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Order ID & Date</th>
                <th className="px-6 py-4">Customer Info</th>
                <th className="px-6 py-4">Delivery Address</th>
                <th className="px-6 py-4">Items & Amount</th>
                <th className="px-6 py-4">Assigned Rider</th>
                <th className="px-6 py-4">Status Pipeline</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                    
                    {/* Order ID & Date */}
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      <div>{order.orderNumber}</div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}
                      </span>
                    </td>

                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{order.customerName}</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{order.customerPhone || "No Phone"}</span>
                    </td>

                    {/* Delivery Address */}
                    <td className="px-6 py-4 max-w-[180px] truncate" title={order.deliveryAddress}>
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">{order.deliveryAddress}</span>
                    </td>

                    {/* Items & Total */}
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-900 dark:text-white">{formatPrice(Number(order.totalAmount || order.total))}</div>
                      <span className="text-[10px] text-slate-400 font-semibold">{order.items?.length || 1} Item(s)</span>
                    </td>

                    {/* Assigned Rider Selection */}
                    <td className="px-6 py-4">
                      <select
                        value={order.riderId || ""}
                        onChange={(e) => handleAssignRider(order.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
                      >
                        <option value="">-- Assign Rider --</option>
                        {availableRiders.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.fullName} ({r.riderId})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status Pipeline Update */}
                    <td className="px-6 py-4">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                        className={`px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider focus:outline-none ${
                          order.status === "COMPLETED" ? "text-emerald-600 dark:text-emerald-400" :
                          order.status === "DELIVERED" ? "text-blue-600 dark:text-blue-400" :
                          order.status === "OUT_FOR_DELIVERY" ? "text-cyan-600 dark:text-cyan-400" :
                          order.status === "CANCELLED" ? "text-rose-600 dark:text-rose-400" : "text-kaya-orange"
                        }`}
                      >
                        <option value="ORDER_PLACED">1. Order Placed</option>
                        <option value="ORDER_CONFIRMED">2. Order Confirmed</option>
                        <option value="PREPARING">3. Preparing Order</option>
                        <option value="PACKED">4. Packed</option>
                        <option value="ASSIGNED_TO_RIDER">5. Assigned to Rider</option>
                        <option value="OUT_FOR_DELIVERY">6. Out for Delivery</option>
                        <option value="ARRIVING_SOON">7. Arriving Soon</option>
                        <option value="DELIVERED">8. Delivered</option>
                        <option value="COMPLETED">9. Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center space-x-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="h-4 w-4 text-kaya-orange" />
                      </button>

                      {order.signatureData && (
                        <button 
                          onClick={() => setProofOrder(order)}
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 font-bold transition-colors"
                          title="View Digital Proof of Delivery"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-kaya-orange tracking-widest">ORDER SPECIFICATION</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedOrder.orderNumber}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Information</p>
                <p className="font-extrabold text-slate-900 dark:text-white">{selectedOrder.customerName}</p>
                <p className="text-slate-500">{selectedOrder.customerPhone || "No Phone"}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Delivery Address</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.deliveryAddress}</p>
                <p className="text-slate-500">{selectedOrder.deliveryDate} ({selectedOrder.deliveryTime || "Anytime"})</p>
              </div>
            </div>

            {/* Rider Info */}
            <div className="bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex justify-between items-center text-xs">
              <div>
                <p className="text-[10px] font-bold text-kaya-orange uppercase">Assigned Fleet Rider</p>
                <p className="font-extrabold text-slate-900 dark:text-white">
                  {selectedOrder.rider ? selectedOrder.rider.fullName : "No Rider Assigned Yet"}
                </p>
              </div>

              <select
                value={selectedOrder.riderId || ""}
                onChange={(e) => handleAssignRider(selectedOrder.id, e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                <option value="">-- Assign Rider --</option>
                {availableRiders.map((r) => (
                  <option key={r.id} value={r.id}>{r.fullName} ({r.riderId})</option>
                ))}
              </select>
            </div>

            {/* Timeline Progress */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase text-slate-400">Order Progress Timeline History</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {selectedOrder.timeline?.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-955 p-3 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[10px] text-slate-400">{t.description}</p>
                    </div>
                    <span className="text-[9px] text-kaya-orange font-bold uppercase">{t.updatedBy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Proof section if complete */}
            {selectedOrder.signatureData && (
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setProofOrder(selectedOrder);
                }}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>View Customer Signature & Delivery Proof</span>
              </button>
            )}

          </div>
        </div>
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
