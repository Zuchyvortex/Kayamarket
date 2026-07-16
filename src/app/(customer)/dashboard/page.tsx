"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { User, ShoppingBag, Heart, MapPin, Plus, LogOut, CheckCircle, Package, Truck, Home } from "lucide-react";
import Link from "next/link";

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { orders, wishlist, toggleWishlist, addToCart, addresses, addAddress, removeAddress, setDefaultAddress } = useCart();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  // Tab state: 'orders' | 'wishlist' | 'addresses' | 'profile'
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>('orders');

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (street && city && state) {
      addAddress({ street, city, state, isDefault: false });
      setStreet("");
      setCity("");
      setState("");
      setShowAddressForm(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white text-[#111111]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-100 pb-8">
        <div>
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">My Dashboard</span>
          <h1 className="text-3xl font-black text-[#111111] tracking-tight mt-1">My Account</h1>
          <p className="text-slate-500 text-sm">Hello, {user.name} — Manage your profile details, order histories, and addresses</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center space-x-2 text-rose-600 hover:text-rose-700 font-bold text-xs uppercase tracking-wider focus:outline-none border border-rose-100 hover:bg-rose-50/50 px-4 py-2.5 rounded-xl transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar - Clean, high contrast */}
        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 h-fit space-y-2">
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
                  ? "bg-slate-900 text-white shadow-md" 
                  : "text-slate-650 hover:bg-white hover:shadow-sm"
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
              <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Order History</h2>
              
              {orders.length === 0 ? (
                <div className="bg-slate-50 rounded-[3rem] p-16 text-center border border-slate-100 space-y-6">
                  <div className="p-4 bg-white rounded-full w-fit mx-auto shadow-sm">
                    <ShoppingBag className="h-10 w-10 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">No orders placed yet</h3>
                    <p className="text-xs text-slate-550 max-w-xs mx-auto">Browse our parboiled rice, beans, fresh vegetables, and fill your basket today!</p>
                  </div>
                  <Link href="/products" className="inline-block bg-kaya-orange hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full text-xs shadow-md transition-colors">
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden p-6 sm:p-8 space-y-6 shadow-sm">
                      
                      {/* Order info banner */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ORDER NUMBER</p>
                          <p className="text-sm font-bold text-slate-900">{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DATE PLACED</p>
                          <p className="text-sm font-bold text-slate-900">{order.date}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TOTAL AMOUNT</p>
                          <p className="text-sm font-black text-slate-900">{formatPrice(order.total)}</p>
                        </div>
                        <div>
                          <span className={`inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            order.status === "Delivered" ? "bg-green-50 text-kaya-green border border-green-150" :
                            order.status === "Cancelled" ? "bg-rose-50 text-rose-700 border border-rose-100" : 
                            "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Items loop */}
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-150 shrink-0">
                              <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-xs">
                              <p className="font-extrabold text-slate-900">{item.productName}</p>
                              <p className="text-slate-450 mt-0.5">Quantity: {item.quantity} × {formatPrice(item.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Simple Tracking state visual */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order Tracking Status</p>
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-400 relative before:absolute before:left-1/8 before:right-1/8 before:top-4.5 before:h-[2px] before:bg-slate-200">
                          
                          <div className={`relative z-10 flex flex-col items-center gap-1.5 ${order.status !== "Cancelled" ? "text-kaya-orange" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status !== "Cancelled" ? "bg-orange-50 border-2 border-kaya-orange text-kaya-orange" : "bg-slate-200"}`}>
                              <Package className="h-3.5 w-3.5" />
                            </div>
                            <span>Placed</span>
                          </div>

                          <div className={`relative z-10 flex flex-col items-center gap-1.5 ${['Preparing', 'Out for Delivery', 'Delivered'].includes(order.status) ? "text-kaya-orange" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['Preparing', 'Out for Delivery', 'Delivered'].includes(order.status) ? "bg-orange-50 border-2 border-kaya-orange text-kaya-orange" : "bg-slate-200"}`}>
                              <CheckCircle className="h-3.5 w-3.5" />
                            </div>
                            <span>Preparing</span>
                          </div>

                          <div className={`relative z-10 flex flex-col items-center gap-1.5 ${['Out for Delivery', 'Delivered'].includes(order.status) ? "text-kaya-orange" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['Out for Delivery', 'Delivered'].includes(order.status) ? "bg-orange-50 border-2 border-kaya-orange text-kaya-orange" : "bg-slate-200"}`}>
                              <Truck className="h-3.5 w-3.5" />
                            </div>
                            <span>Shipped</span>
                          </div>

                          <div className={`relative z-10 flex flex-col items-center gap-1.5 ${order.status === 'Delivered' ? "text-kaya-orange" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'Delivered' ? "bg-orange-50 border-2 border-kaya-orange text-kaya-orange" : "bg-slate-200"}`}>
                              <Home className="h-3.5 w-3.5" />
                            </div>
                            <span>Delivered</span>
                          </div>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">My Wishlist</h2>
              
              {wishlist.length === 0 ? (
                <div className="bg-slate-50 rounded-[3rem] p-16 text-center border border-slate-100 space-y-6">
                  <div className="p-4 bg-white rounded-full w-fit mx-auto shadow-sm">
                    <Heart className="h-10 w-10 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">Wishlist is empty</h3>
                    <p className="text-xs text-slate-550 max-w-xs mx-auto">Tap the heart button on any product to save it here for quick reference.</p>
                  </div>
                  <Link href="/products" className="inline-block bg-kaya-orange hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full text-xs shadow-md transition-colors">
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {wishlist.map((product) => (
                    <div key={product.id} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm relative flex flex-col justify-between hover:shadow-md transition-all">
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-6 right-6 z-10 p-2.5 bg-rose-50 text-rose-500 rounded-full shadow-sm"
                      >
                        <Heart className="h-4 w-4 fill-rose-500" />
                      </button>

                      <div>
                        <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-50 mb-3 border border-slate-100">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-extrabold text-slate-850 line-clamp-1 text-sm">{product.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{formatPrice(product.price)}</p>
                      </div>

                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white font-bold py-2.5 rounded-xl text-xs mt-4 transition-all shadow-md"
                      >
                        Add to Basket
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-xl font-extrabold text-slate-900">Address Book</h2>
                <button 
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="bg-kaya-orange hover:bg-orange-655 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New</span>
                </button>
              </div>

              {/* Add form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 animate-in slide-in-from-top duration-300">
                  <h3 className="font-bold text-xs text-slate-600 uppercase">New Address Details</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Street Address</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. 12 Admiralty Way, Lekki Phase 1" 
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Lekki" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">State</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Lagos" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl">
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
                  <div key={addr.id} className={`bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-sm transition-all ${addr.isDefault ? "ring-2 ring-kaya-green bg-green-50/5" : ""}`}>
                    <div>
                      <div className="flex justify-between items-start">
                        <MapPin className="h-5 w-5 text-kaya-green" />
                        {addr.isDefault && (
                          <span className="text-[9px] bg-green-100 text-kaya-green px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 mt-4">{addr.street}</p>
                      <p className="text-xs text-slate-450 mt-1">{addr.city}, {addr.state}</p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      {!addr.isDefault && (
                        <button 
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-[10px] font-black uppercase text-kaya-green hover:text-green-700"
                        >
                          Set Default
                        </button>
                      )}
                      <button 
                        onClick={() => removeAddress(addr.id)}
                        className="text-[10px] font-black uppercase text-rose-600 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE DETAILS TAB */}
          {activeTab === "profile" && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Profile Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-extrabold text-slate-800">{user.name}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-extrabold text-slate-800">{user.email}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-extrabold text-slate-800">{user.phone || "Not Specified"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Role</p>
                  <p className="text-sm font-extrabold text-slate-800">{user.role}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
