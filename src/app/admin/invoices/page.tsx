"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, Search, Printer, Download, Calendar, Filter, 
  User, CheckCircle, Clock, Truck, RefreshCw, Eye
} from "lucide-react";
import { getAllInvoices } from "@/app/actions/invoiceActions";
import InvoiceModal from "@/components/InvoiceModal";
import ReportPrintModal from "@/components/ReportPrintModal";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await getAllInvoices({
        query: searchQuery,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setInvoices(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    fetchInvoices();
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
  const totalDeliveryFees = invoices.reduce((sum, inv) => sum + Number(inv.deliveryFee), 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-kaya-orange animate-ping"></span>
            <span className="text-[10px] font-black uppercase text-kaya-orange tracking-widest">
              Permanent Records Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin Invoice Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View, audit, search, print, and export official billing invoices across all completed customer orders
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-5 py-3 rounded-2xl bg-kaya-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Export Invoices Report PDF</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoices</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{invoices.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Billed Revenue</p>
          <p className="text-xl font-black text-kaya-orange">{formatPrice(totalInvoiceValue)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dispatch Fees Billed</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(totalDeliveryFees)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Integrity</p>
          <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-2">Permanent PostgreSQL Records ✓</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Invoice #, Order #, Customer Name, Phone, or Rider..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
            />
          </div>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-kaya-orange text-white font-bold text-xs rounded-xl shadow-md"
          >
            Apply Search
          </button>
        </div>
      </form>

      {/* Invoices List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <FileText className="h-8 w-8 text-kaya-orange animate-bounce mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading permanent invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching invoices found</p>
            <p className="text-xs text-slate-400">Invoices will be automatically generated whenever customer orders are placed or completed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-955 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4 pl-6">Invoice #</th>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Delivery Address</th>
                  <th className="p-4">Payment & Total</th>
                  <th className="p-4">Assigned Rider</th>
                  <th className="p-4">Invoice Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 pl-6 font-black text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-4 font-bold text-kaya-orange">
                      {inv.order?.orderNumber || "KM-ORDER"}
                    </td>
                    <td className="p-4 space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white">{inv.customerName}</p>
                      <p className="text-[10px] text-slate-400">{inv.customerPhone || "No Phone"}</p>
                    </td>
                    <td className="p-4 max-w-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      {inv.customerAddress}
                    </td>
                    <td className="p-4 space-y-0.5">
                      <p className="font-black text-slate-900 dark:text-white">{formatPrice(Number(inv.totalAmount))}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {inv.paymentMethod} ({inv.paymentStatus || 'PAID'})
                      </p>
                    </td>
                    <td className="p-4 space-y-0.5">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{inv.riderName || 'Express Rider'}</p>
                      <p className="text-[10px] text-slate-400">{inv.riderIdCode || 'RD-001'}</p>
                    </td>
                    <td className="p-4 text-slate-500 font-semibold">
                      {new Date(inv.orderDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3.5 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-kaya-orange border border-orange-200 dark:border-orange-900/40 font-bold text-[11px] rounded-xl hover:bg-kaya-orange hover:text-white transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual Invoice Modal View */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          order={selectedInvoice.order || selectedInvoice}
        />
      )}

      {/* Export All Invoices PDF Modal */}
      {showExportModal && (
        <ReportPrintModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="KayaMarket Permanent Invoices Summary Report"
          subtitle="Official Audit Log of Customer Invoices & Billed Transactions"
          dataSummary={[
            { label: "Total Invoices", value: `${invoices.length}` },
            { label: "Gross Billed Value", value: formatPrice(totalInvoiceValue) },
            { label: "Total Delivery Fees", value: formatPrice(totalDeliveryFees) },
            { label: "Report Period", value: "All Available Records" }
          ]}
        >
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b">
              <tr>
                <th className="p-2.5">Invoice #</th>
                <th className="p-2.5">Order #</th>
                <th className="p-2.5">Customer Name</th>
                <th className="p-2.5">Customer Phone</th>
                <th className="p-2.5">Subtotal</th>
                <th className="p-2.5">Delivery Fee</th>
                <th className="p-2.5">Grand Total</th>
                <th className="p-2.5">Payment</th>
                <th className="p-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="p-2.5 font-bold">{inv.invoiceNumber}</td>
                  <td className="p-2.5">{inv.order?.orderNumber}</td>
                  <td className="p-2.5 font-semibold">{inv.customerName}</td>
                  <td className="p-2.5">{inv.customerPhone || 'N/A'}</td>
                  <td className="p-2.5">{formatPrice(Number(inv.subtotal))}</td>
                  <td className="p-2.5">{formatPrice(Number(inv.deliveryFee))}</td>
                  <td className="p-2.5 font-bold">{formatPrice(Number(inv.totalAmount))}</td>
                  <td className="p-2.5">{inv.paymentMethod}</td>
                  <td className="p-2.5">{new Date(inv.orderDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportPrintModal>
      )}

    </div>
  );
}
