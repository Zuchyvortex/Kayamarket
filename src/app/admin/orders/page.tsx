"use client";

import React, { useState } from "react";
import { MOCK_ORDERS, Order } from "@/lib/mockData";
import { ChevronRight, RefreshCw, ClipboardList, ShieldCheck } from "lucide-react";

export default function AdminOrdersBoard() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));
    alert(`Order status updated to ${newStatus}!`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Orders Board</h1>
        <p className="text-slate-400 text-xs mt-1">Manage processing pipeline and client dispatch status updates</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Delivery Address</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Items Summary</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4 text-center">Pipeline Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">
                    <div>{order.orderNumber}</div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">{order.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-200">{order.customerName}</div>
                    <span className="text-[10px] text-slate-500">{order.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 max-w-[150px] truncate" title={order.deliveryAddress}>
                    {order.deliveryAddress}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <div>{order.deliveryDate}</div>
                    <span className="text-[9px] text-slate-500 font-bold">{order.deliveryTime}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-[10px] text-slate-400">
                          {item.productName} <span className="text-white font-bold">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-white">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                        className={`px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold focus:outline-none ${
                          order.status === "Delivered" ? "text-emerald-500" :
                          order.status === "Cancelled" ? "text-rose-500" : "text-amber-500"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
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
