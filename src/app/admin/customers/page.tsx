"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  getCustomers, 
  toggleCustomerStatus, 
  deleteCustomer,
  updateCustomerProfile 
} from "@/app/actions/customerActions";
import { 
  Search, Filter, ShieldAlert, UserCheck, Trash2, Shield, Loader2, 
  Eye, ShoppingBag, DollarSign, Calendar, MapPin, Phone, Mail, Clock, CheckCircle2, Edit2, XCircle
} from "lucide-react";

export default function CustomersManagerPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Profile View Modal state
  const [viewCustomer, setViewCustomer] = useState<any>(null);

  // Edit Customer Modal state
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAltPhone, setEditAltPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

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
    // Auto real-time sync polling every 4s
    const interval = setInterval(fetchCustomers, 4000);
    return () => clearInterval(interval);
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

  const openEditModal = (cust: any) => {
    setEditCustomer(cust);
    setEditFirstName(cust.firstName || "");
    setEditLastName(cust.lastName || "");
    setEditEmail(cust.email || "");
    setEditPhone(cust.phoneNumber || "");
    setEditAltPhone(cust.altPhoneNumber || "");
    setEditAddress(cust.address || cust.deliveryAddress || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    setSubmittingEdit(true);

    try {
      const res = await updateCustomerProfile(editCustomer.id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phoneNumber: editPhone,
        altPhoneNumber: editAltPhone,
        address: editAddress
      });

      if (res.success) {
        setEditCustomer(null);
        fetchCustomers();
      } else {
        alert(res.error || "Failed to update customer profile.");
      }
    } catch (err: any) {
      alert(err.message || "Error updating profile.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const filteredCustomers = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phoneNumber && c.phoneNumber.includes(search))
  );

  return (
    <div className="space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">User Management</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Customer CRM Console</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Complete profile management, order history, spending metrics, and real-time customer data.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[2rem] flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by customer name, email, or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <ShoppingBag className="h-4 w-4 text-kaya-orange" />
          <span>Total Registered Customers: <strong className="text-slate-900 dark:text-white">{customers.length}</strong></span>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium min-w-[950px]">
            <thead className="bg-slate-50 dark:bg-slate-955 text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Customer Info</th>
                <th className="px-6 py-4">Contact Details</th>
                <th className="px-6 py-4">Delivery Address</th>
                <th className="px-6 py-4 text-center">Orders & Spent</th>
                <th className="px-6 py-4 text-center">Account Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-kaya-orange animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                    No registered customers found.
                  </td>
                </tr>
              )}
              {!loading && filteredCustomers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                  
                  {/* Customer Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-orange-100 dark:bg-orange-950 text-kaya-orange font-black">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white text-sm">{user.firstName} {user.lastName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Details */}
                  <td className="px-6 py-4 space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-kaya-orange shrink-0" />
                      <span>{user.email}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                      <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{user.phoneNumber || "No primary phone"}</span>
                    </div>
                    {user.altPhoneNumber && (
                      <div className="text-[10px] text-kaya-orange flex items-center gap-1.5 font-bold">
                        <span>Alt: {user.altPhoneNumber}</span>
                      </div>
                    )}
                  </td>

                  {/* Address */}
                  <td className="px-6 py-4 max-w-[200px]">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 text-kaya-orange shrink-0 mt-0.5" />
                      <span className="truncate">{user.deliveryAddress}</span>
                    </div>
                  </td>

                  {/* Orders & Total Spent */}
                  <td className="px-6 py-4 text-center">
                    <div className="font-black text-slate-900 dark:text-white text-sm">
                      {formatPrice(user.totalAmountSpent)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold space-x-1">
                      <span>{user.totalOrdersCount} Total Orders</span> • 
                      <span className="text-emerald-600 dark:text-emerald-400"> {user.completedOrdersCount} Completed</span>
                    </div>
                  </td>

                  {/* Account Status */}
                  <td className="px-6 py-4 text-center">
                    {user.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                        <UserCheck className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                        <ShieldAlert className="w-3 h-3" />
                        Suspended
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewCustomer(user)}
                        title="View Full Customer Profile"
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-kaya-orange hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        title="Edit Customer Profile"
                        className="p-2 text-slate-600 dark:text-slate-300 hover:text-kaya-orange hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        title={user.status === "ACTIVE" ? "Suspend Account" : "Reactivate Account"}
                        className={`p-2 rounded-xl transition-colors ${user.status === "ACTIVE" ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30" : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"}`}
                      >
                        {user.status === "ACTIVE" ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        title="Delete Customer Account"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
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

      {/* Full Customer Profile View Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-950 border-2 border-kaya-orange flex items-center justify-center font-black text-kaya-orange text-xl overflow-hidden">
                  {viewCustomer.profileImage ? (
                    <img src={viewCustomer.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    `${viewCustomer.firstName?.charAt(0)}${viewCustomer.lastName?.charAt(0)}`
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{viewCustomer.firstName} {viewCustomer.lastName}</h3>
                  <p className="text-xs text-kaya-orange font-bold">{viewCustomer.email}</p>
                  <p className="text-[10px] text-slate-400">Registered: {new Date(viewCustomer.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setViewCustomer(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">✕</button>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Total Spent</p>
                <p className="font-black text-slate-900 dark:text-white text-sm">{formatPrice(viewCustomer.totalAmountSpent)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Total Orders</p>
                <p className="font-black text-kaya-orange text-sm">{viewCustomer.totalOrdersCount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Active Dispatches</p>
                <p className="font-black text-blue-600 dark:text-blue-400 text-sm">{viewCustomer.activeOrdersCount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Completed</p>
                <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{viewCustomer.completedOrdersCount}</p>
              </div>
            </div>

            {/* Contact & Address Box */}
            <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Primary Phone</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewCustomer.phoneNumber || "Not recorded"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Alternative Phone</span>
                <span className="font-bold text-kaya-orange">{viewCustomer.altPhoneNumber || "None provided"}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Delivery Address</span>
                <span className="font-bold text-slate-900 dark:text-white max-w-[280px] text-right">{viewCustomer.deliveryAddress}</span>
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Customer Order History ({viewCustomer.orders?.length || 0})</p>
              {viewCustomer.orders?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No orders placed by this customer yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {viewCustomer.orders?.map((o: any) => (
                    <div key={o.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-955 p-3 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{o.orderNumber}</p>
                        <p className="text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 dark:text-white">{formatPrice(Number(o.totalAmount))}</p>
                        <span className="font-black uppercase text-[9px] text-kaya-orange">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setViewCustomer(null)}
              className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Edit Customer Profile Modal */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Customer Profile</h3>
                <p className="text-xs text-slate-400">Update customer records and address info</p>
              </div>
              <button onClick={() => setEditCustomer(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Primary Phone Number</label>
                  <input 
                    type="text" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+234 802 000 0000"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Alternative Phone Number</label>
                  <input 
                    type="text" 
                    value={editAltPhone}
                    onChange={(e) => setEditAltPhone(e.target.value)}
                    placeholder="+234 803 111 2222"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Delivery Address</label>
                <input 
                  type="text" 
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="e.g. 15 Admiralty Way, Lekki Phase 1"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingEdit}
                className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                {submittingEdit ? "Saving Profile..." : "Update Customer Record"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
