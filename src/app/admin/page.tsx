import React from "react";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight, TrendingUp, ShoppingCart, UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardHome() {
  const [totalOrders, orders, products, usersCount, revenueObj, lowStockCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: true }
    }),
    prisma.product.findMany({
      where: { inventory: { lt: 10 } },
      take: 3
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } }
    }),
    prisma.product.count({ where: { inventory: { lt: 10 } } })
  ]);

  const totalRevenue = Number(revenueObj._sum.totalAmount || 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="space-y-10 bg-slate-50 text-[#111111]">
      <div>
        <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Console Home</span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Overview Dashboard</h1>
        <p className="text-slate-500 text-xs">Real-time enterprise metrics for KayaMarket grocery operations</p>
      </div>

      {/* KPI Cards - Redesigned to be clean and light */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", val: formatPrice(totalRevenue), change: "+12.4% from last week", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Orders", val: totalOrders, change: "Live from DB", icon: ShoppingCart, color: "text-kaya-orange bg-orange-50" },
          { label: "Active Customers", val: usersCount, change: "Registered users", icon: UserCheck, color: "text-slate-950 bg-slate-100" },
          { label: "Low-Stock Alerts", val: lowStockCount, change: `${lowStockCount} items need attention`, icon: AlertTriangle, color: "text-rose-600 bg-rose-50" }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 rounded-[2rem] space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{kpi.change}</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly sales charts mockup */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-[2rem] space-y-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Weekly Revenue Stream</h3>
            <span className="text-[10px] font-black text-kaya-green bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Live</span>
          </div>

          <div className="flex items-end justify-between h-48 pt-4">
            {[
              { day: "Mon", val: 45, label: "₦450k" },
              { day: "Tue", val: 68, label: "₦680k" },
              { day: "Wed", val: 82, label: "₦820k" },
              { day: "Thu", val: 55, label: "₦550k" },
              { day: "Fri", val: 95, label: "₦950k" },
              { day: "Sat", val: 120, label: "₦1.2M" },
              { day: "Sun", val: 78, label: "₦780k" }
            ].map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                <span className="text-[9px] font-black text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.label}
                </span>
                <div className="w-8 sm:w-10 bg-slate-100 rounded-t-lg h-36 relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-kaya-orange to-amber-500 rounded-t-lg transition-all duration-1000" 
                    style={{ height: `${(bar.val / 120) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low inventory details widget */}
        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Low Stock Watch</h3>
            <Link href="/admin/inventory" className="text-[10px] text-kaya-orange font-bold hover:underline uppercase tracking-wider">View All</Link>
          </div>

          <div className="space-y-4">
            {products.map((p) => (
              <div key={p.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                    <img src={p.images?.[0] || "/w-1.png"} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-rose-600">{p.inventory} left</p>
                  <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">Alert</span>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">All products are adequately stocked.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Board */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Recent Orders Board</h3>
          <Link href="/admin/orders" className="text-xs text-kaya-orange font-bold hover:underline flex items-center gap-0.5 tracking-wider uppercase">
            <span>Manage Board</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Order Ref</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="px-6 py-4">{order.user.firstName} {order.user.lastName}</td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-black text-slate-900">{formatPrice(Number(order.totalAmount))}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      order.status === "DELIVERED" ? "bg-green-50 text-kaya-green border border-green-150" : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
