"use client";

import React from "react";
import { X, ShieldCheck, CheckCircle2, Calendar, User, FileText } from "lucide-react";

interface OrderProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    orderNumber: string;
    customerName: string;
    proofCustomerName?: string | null;
    signatureType?: string | null;
    signatureData?: string | null;
    confirmedAt?: Date | string | null;
    status: string;
  } | null;
}

export default function OrderProofModal({
  isOpen,
  onClose,
  order
}: OrderProofModalProps) {
  if (!isOpen || !order) return null;

  const formattedDate = order.confirmedAt 
    ? new Date(order.confirmedAt).toLocaleString('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : "Date not recorded";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-kaya-green" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Proof of Delivery Record</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified Receipt for Order <strong className="text-slate-900 dark:text-slate-200">{order.orderNumber}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Box */}
        <div className="space-y-5 text-xs text-slate-600 dark:text-slate-300">
          
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 p-4 rounded-2xl flex items-center gap-3 text-kaya-green dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-extrabold text-sm">Delivery Confirmed & Completed</p>
              <p className="text-[10px] text-green-700 dark:text-emerald-300">Customer has digitally verified receiving this delivery package.</p>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 dark:bg-slate-955 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <span className="flex items-center gap-1.5 text-slate-450 dark:text-slate-400 font-bold uppercase text-[10px]">
                <User className="h-3.5 w-3.5" /> Signer Name
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {order.proofCustomerName || order.customerName}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <span className="flex items-center gap-1.5 text-slate-450 dark:text-slate-400 font-bold uppercase text-[10px]">
                <Calendar className="h-3.5 w-3.5" /> Confirmation Time
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formattedDate}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-450 dark:text-slate-400 font-bold uppercase text-[10px]">
                <FileText className="h-3.5 w-3.5" /> Signature Type
              </span>
              <span className="font-bold text-kaya-orange uppercase text-[10px]">
                {order.signatureType === "DRAWN" ? "Drawn Signature" : "Typed Signature"}
              </span>
            </div>
          </div>

          {/* Signature Rendering Box */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Captured Digital Signature</p>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-center min-h-[120px]">
              {order.signatureType === "DRAWN" && order.signatureData ? (
                <img 
                  src={order.signatureData} 
                  alt="Customer Signature" 
                  className="max-h-24 object-contain"
                />
              ) : (
                <p className="text-3xl font-serif italic text-kaya-orange tracking-widest">
                  {order.signatureData || order.proofCustomerName || order.customerName}
                </p>
              )}
            </div>
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3 rounded-2xl text-xs transition-colors"
        >
          Close Proof Window
        </button>

      </div>
    </div>
  );
}
