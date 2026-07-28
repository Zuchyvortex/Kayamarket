"use client";

import React from "react";
import { Printer, Download, X, CheckCircle, ShieldCheck } from "lucide-react";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export default function InvoiceModal({ isOpen, onClose, order }: InvoiceModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  const invoiceNumber = order.invoice?.invoiceNumber || `INV-2026-${order.orderNumber?.replace(/[^0-9]/g, '') || '1001'}`;
  const subtotal = order.subtotal || Math.max(0, Number(order.totalAmount || 0) - Number(order.deliveryFee || 4000));
  const deliveryFee = Number(order.deliveryFee || 4000);
  const totalAmount = Number(order.totalAmount || subtotal + deliveryFee);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:p-8">
        
        {/* Header Action Bar (Hidden during print) */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-kaya-orange/10 text-kaya-orange text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
              OFFICIAL INVOICE
            </span>
            <span className="text-xs font-mono text-slate-400">{invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-kaya-orange hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Download PDF</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* INVOICE CONTENT (Printable Region) */}
        <div id="printable-invoice" className="space-y-8">
          
          {/* Brand & Invoice Details Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <img src="/k-1.png" alt="KayaMarket" className="h-10 w-auto mb-2 object-contain" />
              <p className="text-[11px] text-slate-500 font-medium">Farm-Fresh Foods & Fast Logistics Delivery</p>
              <p className="text-[10px] text-slate-400">Lagos, Nigeria • support@kayamarket.com</p>
            </div>

            <div className="text-right sm:text-right">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">INVOICE</h2>
              <p className="text-xs font-mono font-bold text-kaya-orange">{invoiceNumber}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Order #: <strong>{order.orderNumber}</strong>
              </p>
              <p className="text-[10px] text-slate-400">
                Date: {new Date(order.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>

          {/* Customer & Rider Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            
            {/* Customer info */}
            <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">BILLED TO (CUSTOMER)</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">{order.customerName}</p>
              <p className="text-slate-600 dark:text-slate-300 font-medium">{order.deliveryAddress}</p>
              <p className="text-slate-500">Phone: {order.customerPhone || "N/A"}</p>
              {order.customerAltPhone && <p className="text-slate-500">Alt Phone: {order.customerAltPhone}</p>}
            </div>

            {/* Rider & Logistics info */}
            <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">DISPATCH & FULFILLMENT</span>
              <p className="font-extrabold text-slate-900 dark:text-white">
                Rider: {order.rider?.fullName || order.invoice?.riderName || "Kaya Fleet Rider"}
              </p>
              <p className="text-slate-500 font-mono">
                Rider ID: {order.rider?.riderId || order.invoice?.riderIdCode || "RD-001"}
              </p>
              <p className="text-slate-500">
                Delivery Slot: {order.deliveryDate || "Today"} ({order.deliveryTime || "Morning"})
              </p>
              <p className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Status: {order.status} ({order.paymentStatus || "PAID"})</span>
              </p>
            </div>

          </div>

          {/* Items Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Product Item</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-3 font-bold">{item.productName}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">{formatPrice(Number(item.price))}</td>
                    <td className="p-3 text-right font-bold">{formatPrice(Number(item.price) * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment & Fee Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2 text-xs">
            
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400">Payment Information</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Payment Method: <span className="text-kaya-orange">{order.paymentMethod || "Bank Transfer"}</span>
              </p>
              <p className="text-slate-500">
                Payment Status: <span className="text-emerald-600 font-bold">{order.paymentStatus || "PAID"}</span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-72 space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Product Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 dark:text-white text-base border-t border-slate-200 dark:border-slate-800 pt-2">
                <span>Total Paid</span>
                <span className="text-kaya-orange">{formatPrice(totalAmount)}</span>
              </div>
            </div>

          </div>

          {/* Signature / Confirmation Footer */}
          {order.signatureData && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Digital Delivery Receipt
                </span>
                <p className="font-bold">Confirmed by: {order.proofCustomerName || order.customerName}</p>
                <p className="text-[10px] text-emerald-600/80">
                  Confirmed Date: {order.confirmedAt ? new Date(order.confirmedAt).toLocaleString() : "Confirmed"}
                </p>
              </div>

              {order.signatureType === "DRAWN" && order.signatureData.startsWith("data:image") ? (
                <img src={order.signatureData} alt="Signature" className="h-10 w-auto bg-white p-1 rounded border border-emerald-300" />
              ) : (
                <div className="font-serif italic font-bold text-lg border-b border-emerald-400 px-3 py-1">
                  {order.signatureData || order.proofCustomerName}
                </div>
              )}
            </div>
          )}

          <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
            Thank you for shopping with KayaMarket! For logistics inquiries, contact support@kayamarket.com.
          </div>

        </div>

      </div>
    </div>
  );
}
