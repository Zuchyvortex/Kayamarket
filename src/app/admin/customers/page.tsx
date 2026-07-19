"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getCustomers, toggleCustomerStatus, deleteCustomer } from "@/app/actions/customerActions";
import { Search, Filter, MoreVertical, ShieldAlert, UserCheck, Trash2, Shield, Loader2 } from "lucide-react";

export default function CustomersManagerPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const fetchCustomers = () => {
    startTransition(() => {
      getCustomers().then((data) => {
        setCustomers(data);
        setLoading(false);
      });
    });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id: string) => {
    await toggleCustomerStatus(id);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      await deleteCustomer(id);
      fetchCustomers();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const filteredCustomers = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">User CRM</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Customer Management</h1>
          <p className="text-slate-500 text-xs mt-1">Manage all registered accounts and view activity</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-kaya-orange transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
          <Filter className="h-4 w-4" />
          <span>Filter List</span>
        </button>
      </div>

      {/* Customer List */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Orders</th>
                <th className="px-6 py-4 text-right">Total Spent</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-kaya-orange animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">
                    No customers found.
                  </td>
                </tr>
              )}
              {!loading && filteredCustomers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 font-bold">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.firstName} {user.lastName}</div>
                        <div className="text-[10px] text-slate-400">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{user.email}</div>
                    <div className="text-[10px] text-slate-500">{user.phoneNumber || "No phone"}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-block bg-slate-100 px-3 py-1 rounded-full font-black text-slate-700">
                      {user.completedOrdersCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    {formatPrice(user.totalSpent)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-50 text-kaya-green border border-green-150">
                        <UserCheck className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
                        <ShieldAlert className="w-3 h-3" />
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.status === "ACTIVE" ? "Suspend Account" : "Reactivate Account"}
                        className={`p-2 rounded-xl transition-colors ${user.status === "ACTIVE" ? "text-rose-500 hover:bg-rose-50" : "text-green-500 hover:bg-green-50"}`}
                      >
                        {user.status === "ACTIVE" ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
