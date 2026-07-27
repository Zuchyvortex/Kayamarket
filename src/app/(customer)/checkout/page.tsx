"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, CreditCard, ArrowLeft, CheckCircle, ShieldCheck, Plus, Phone } from "lucide-react";
import Link from "next/link";
import { createOrder } from "@/app/actions/orderActions";

import { getSystemSettings } from "@/app/actions/settingActions";

export default function CheckoutPage() {
  const { cart, cartTotal, addresses, addAddress, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // Settings & Delivery Fee
  const [deliveryFee, setDeliveryFee] = useState(4000);

  useEffect(() => {
    getSystemSettings().then(s => {
      if (s && s.deliveryFee) setDeliveryFee(s.deliveryFee);
    });
  }, []);

  // Success state
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if cart is empty and order not placed
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      router.push("/cart");
    }
  }, [cart, orderSuccess]);

  // Form State
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?.id || "");
  const [phone, setPhone] = useState(user?.phone || "+234 803 123 4567");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("Morning (10:00 AM - 12:00 PM)");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  
  // New address state
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStreet && newCity && newState) {
      addAddress({
        street: newStreet,
        city: newCity,
        state: newState,
        isDefault: false
      });
      setNewStreet("");
      setNewCity("");
      setNewState("");
      setShowAddressForm(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && addresses.length === 0) {
      alert("Please select or add a delivery address.");
      return;
    }
    if (!deliveryDate) {
      alert("Please select a preferred delivery date.");
      return;
    }

    setLoading(true);

    const selectedAddrObj = addresses.find(a => a.id === selectedAddress) || addresses[0];
    const fullAddress = selectedAddrObj 
      ? `${selectedAddrObj.street}, ${selectedAddrObj.city}, ${selectedAddrObj.state}`
      : "No address specified";

    const customerName = user ? user.name : "Valued Customer";

    try {
      const result = await createOrder({
        userId: user?.id,
        customerName,
        customerPhone: phone,
        deliveryAddress: fullAddress,
        deliveryDate,
        deliveryTime,
        paymentMethod,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: cartTotal,
        deliveryFee,
        totalAmount: cartTotal + deliveryFee
      });

      if (result.success && result.order) {
        setPlacedOrderDetails(result.order);
        setOrderSuccess(true);
        clearCart();
      } else {
        alert(result.error || "Failed to place order.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred while placing order.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const totalAmount = cartTotal + deliveryFee;

  if (orderSuccess && placedOrderDetails) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-8 animate-in fade-in zoom-in duration-300 bg-white dark:bg-slate-900 text-[#111111] dark:text-slate-100 rounded-[3rem] my-10 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="bg-green-50 dark:bg-green-950/40 text-kaya-green w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner border border-green-200 dark:border-green-900/40">
          <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Order Placed Successfully!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Thank you for shopping with KayaMarket. Order <strong className="text-slate-900 dark:text-white">{placedOrderDetails.orderNumber}</strong> is saved and live in dispatch management.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="bg-slate-50 dark:bg-slate-955 p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 text-left space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Delivery Information</h3>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-semibold">
            <div>Customer Name: <span className="font-bold text-slate-900 dark:text-white">{placedOrderDetails.customerName}</span></div>
            <div>Phone Number: <span className="font-bold text-slate-900 dark:text-white">{placedOrderDetails.customerPhone || "N/A"}</span></div>
            <div>Delivery Address: <span className="font-bold text-slate-900 dark:text-white">{placedOrderDetails.deliveryAddress}</span></div>
            <div>Scheduled Delivery: <span className="font-bold text-slate-900 dark:text-white">{placedOrderDetails.deliveryDate} ({placedOrderDetails.deliveryTime})</span></div>
            <div>Payment Method: <span className="font-bold text-slate-900 dark:text-white">{placedOrderDetails.paymentMethod}</span></div>
            <div>Total Paid: <span className="font-black text-kaya-orange text-sm">{formatPrice(Number(placedOrderDetails.totalAmount))}</span></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="bg-kaya-orange hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-2xl text-xs shadow-md transition-all">
            Track Order Live Pipeline
          </Link>
          <Link href="/products" className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-8 py-3.5 rounded-2xl text-xs transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-slate-950 text-[#111111] dark:text-slate-100 font-sans">
      
      {/* Back button */}
      <Link href="/cart" className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-kaya-orange font-bold text-xs uppercase mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Basket</span>
      </Link>

      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-10">Secure Checkout & Dispatch</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Columns: Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Address & Contact */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-kaya-orange" />
                <h2 className="font-black text-slate-900 dark:text-white text-lg">Delivery Address & Contact</h2>
              </div>
              <button 
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold text-kaya-orange hover:text-orange-600 flex items-center gap-1 focus:outline-none"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400">Customer Phone Number (For Dispatch Rider)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 803 000 0000" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                />
              </div>
            </div>

            {/* Existing Addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div 
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedAddress === addr.id 
                      ? "bg-orange-50/50 dark:bg-orange-950/30 border-kaya-orange shadow-inner" 
                      : "bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{addr.street}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{addr.city}, {addr.state}</p>
                </div>
              ))}
            </div>

            {/* Add Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddNewAddress} className="bg-slate-50 dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top duration-300">
                <h3 className="font-bold text-xs text-slate-500 uppercase">New Address Details</h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Street Address</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 12 Admiralty Way, Lekki Phase 1" 
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Lekki" 
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">State</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Lagos" 
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-kaya-orange text-white text-xs font-bold rounded-xl">
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 2. Delivery Scheduling */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Calendar className="h-5 w-5 text-kaya-orange" />
              <h2 className="font-black text-slate-900 dark:text-white text-lg">Delivery Schedule</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Preferred Delivery Date</label>
                <input 
                  type="date" 
                  required 
                  min={getMinDate()}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">Preferred Time Slot</label>
                <div className="flex flex-col gap-2">
                  {[
                    "Morning (10:00 AM - 12:00 PM)",
                    "Afternoon (02:00 PM - 04:00 PM)"
                  ].map((slot) => (
                    <label 
                      key={slot}
                      className={`flex items-center space-x-3 px-4 py-3 border rounded-2xl cursor-pointer transition-all text-xs font-bold ${
                        deliveryTime === slot 
                          ? "bg-orange-50/50 dark:bg-orange-950/30 border-kaya-orange text-kaya-orange" 
                          : "bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="timeSlot" 
                        value={slot} 
                        checked={deliveryTime === slot}
                        onChange={() => setDeliveryTime(slot)}
                        className="hidden"
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <CreditCard className="h-5 w-5 text-kaya-orange" />
              <h2 className="font-black text-slate-900 dark:text-white text-lg">Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "Bank Transfer", desc: "Pay via instant transfer" },
                { name: "Card Payment", desc: "Pay securely online" },
                { name: "Pay on Delivery", desc: "Pay cash or POS on arrival" }
              ].map((method) => (
                <label 
                  key={method.name}
                  className={`flex flex-col justify-between p-5 border rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === method.name 
                      ? "bg-orange-50/50 dark:bg-orange-950/30 border-kaya-orange shadow-inner" 
                      : "bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method.name} 
                    checked={paymentMethod === method.name}
                    onChange={() => setPaymentMethod(method.name)}
                    className="hidden"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{method.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Checkout Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="font-black text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-slate-800 pb-4">Order Checkout</h2>
            
            <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-300 line-clamp-1">{item.productName} <span className="font-bold text-slate-900 dark:text-white">x{item.quantity}</span></span>
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dispatch Fee</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>Grand Total</span>
                <span className="text-kaya-orange">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-kaya-orange hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-xs focus:outline-none"
            >
              <span>{loading ? "Saving Order..." : "Confirm & Place Order"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
            <ShieldCheck className="h-8 w-8 text-kaya-orange shrink-0" />
            <span>
              Orders automatically sync with the Admin Dispatch Console and assign dedicated riders.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
