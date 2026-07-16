"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Plus, Minus } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === "KAYAFRESH10") {
      setDiscount(cartTotal * 0.1);
      setCouponApplied(true);
      alert("10% Coupon Applied Successfully!");
    } else {
      alert("Invalid coupon code. Try 'KAYAFRESH10'");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const deliveryFee = cart.length > 0 ? 2000 : 0;
  const finalTotal = cartTotal - discount + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6 bg-white text-[#111111]">
        <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-kaya-orange border border-orange-100">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your basket is empty</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Go back to shop and choose some fresh foodstuffs!</p>
        <Link href="/products" className="inline-block bg-kaya-orange hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full text-sm shadow-md hover:shadow-lg transition-all">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white text-[#111111]">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-12">Shopping Basket</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            {cart.map((item) => (
              <div key={item.productId} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-150 shrink-0">
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 hover:text-kaya-orange transition-colors">
                      <Link href={`/products/${item.productId}`}>{item.productName}</Link>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Price: {formatPrice(item.price)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8">
                  {/* Quantity adjustment */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 text-slate-500 hover:text-kaya-orange transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 text-slate-500 hover:text-kaya-orange transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="font-black text-slate-900">{formatPrice(item.price * item.quantity)}</span>

                  {/* Delete button */}
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Link href="/products" className="flex items-center gap-2 text-slate-550 hover:text-kaya-orange font-bold text-xs uppercase transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
            <button 
              onClick={clearCart}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider"
            >
              Clear Basket
            </button>
          </div>
        </div>

        {/* Right: Cart Summary */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-4">Order Summary</h2>
            
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Basket Subtotal</span>
                <span className="font-bold text-slate-800">{formatPrice(cartTotal)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-kaya-green font-bold">
                  <span>10% Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-800">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 pt-4 border-t border-slate-100">
                <span>Total Amount</span>
                <span className="text-slate-950">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-sm text-center"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Coupon field */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Apply Coupon</h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Code (e.g. KAYAFRESH10)" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 text-xs font-semibold"
              />
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors">
                Apply
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
