"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, DollarSign, TrendingUp, TrendingDown, FileText, Download, 
  RefreshCw, CheckCircle2, ShieldCheck, PieChart, ShoppingBag, Truck 
} from "lucide-react";
import { getFinancialSummary } from "@/app/actions/financialActions";

export default function AdminFinancialsPage() {
  const [financials, setFinancials] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getFinancialSummary();
      setFinancials(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  const exportCSV = () => {
    if (!financials) return;
    const csvRows = [
      ["KayaMarket Financial Statement Report"],
      ["Generated Date", new Date().toLocaleString()],
      [""],
      ["Financial Metric", "Amount (NGN)"],
      ["Total Sales Revenue", financials.totalSalesRevenue],
      ["Product Sales Revenue", financials.productSalesRevenue],
      ["Delivery Fee Revenue", financials.deliveryRevenue],
      ["Cost of Goods Sold (COGS)", financials.costOfGoodsSold],
      ["Gross Profit", financials.grossProfit],
      ["Gross Procurement Cost", financials.grossProcurementCost],
      ["Farmer Commissions Paid", financials.totalFarmerCommissions],
      ["Net Operating Profit", financials.netProfit],
      ["Current Inventory Valuation", financials.inventoryValuation],
      [""],
      ["Paid Orders Count", financials.paidOrdersCount],
      ["Procurement Records Count", financials.procurementsCount],
      ["Registered Farmers Count", financials.farmersCount]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KayaMarket_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/40">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Financial Reporting Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Reports & Profitability
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time financial statement tracking sales revenue, cost of goods sold (COGS), gross profit, and net earnings.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-kaya-orange transition-colors"
            title="Refresh Financial Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={exportCSV}
            disabled={!financials}
            className="bg-slate-900 dark:bg-kaya-orange hover:bg-kaya-orange text-white font-bold px-6 py-3.5 rounded-2xl shadow-md transition-all text-xs flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV Financials</span>
          </button>
        </div>
      </div>

      {loading || !financials ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-kaya-orange animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400">Calculating Enterprise Financial Metrics...</p>
        </div>
      ) : (
        <>
          {/* Main Profit Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Total Sales Revenue</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatPrice(financials.totalSalesRevenue)}</p>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> {financials.paidOrdersCount} Paid Orders
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Cost of Goods Sold (COGS)</span>
              <p className="text-2xl font-black text-rose-500">{formatPrice(financials.costOfGoodsSold)}</p>
              <span className="text-[10px] text-slate-400 font-semibold">Base product cost</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Gross Profit</span>
              <p className="text-2xl font-black text-emerald-500">{formatPrice(financials.grossProfit)}</p>
              <span className="text-[10px] text-emerald-600 font-bold">Product Sales - COGS</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-900 dark:to-orange-950/20">
              <span className="text-[10px] font-black uppercase text-kaya-orange">Net Operating Profit</span>
              <p className="text-2xl font-black text-kaya-orange">{formatPrice(financials.netProfit)}</p>
              <span className="text-[10px] text-slate-400 font-semibold">After delivery & commissions</span>
            </div>

          </div>

          {/* Secondary Financial Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Delivery Revenue</span>
              <p className="text-xl font-black text-slate-900 dark:text-white">{formatPrice(financials.deliveryRevenue)}</p>
              <p className="text-[10px] text-slate-400">Collected from delivery fees</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Gross Procurement Cost</span>
              <p className="text-xl font-black text-amber-500">{formatPrice(financials.grossProcurementCost)}</p>
              <p className="text-[10px] text-slate-400">{financials.procurementsCount} farm procurement orders</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400">Current Inventory Valuation</span>
              <p className="text-xl font-black text-blue-500">{formatPrice(financials.inventoryValuation)}</p>
              <p className="text-[10px] text-slate-400">Stock on hand @ Cost Price</p>
            </div>
          </div>

          {/* Detailed Income Statement Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Profit & Loss Statement (P&L)</h3>
                <p className="text-xs text-slate-400">Automated financial ledger synchronized with sales and procurement</p>
              </div>
              <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                AUDITED
              </span>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Product Sales Revenue</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{formatPrice(financials.productSalesRevenue)}</span>
              </div>

              <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800 text-rose-500">
                <span>Less: Cost of Goods Sold (COGS)</span>
                <span className="font-extrabold">({formatPrice(financials.costOfGoodsSold)})</span>
              </div>

              <div className="flex justify-between py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-955 px-4 rounded-xl font-bold text-slate-900 dark:text-white">
                <span>EQUALS: GROSS PROFIT</span>
                <span className="text-emerald-500 font-black">{formatPrice(financials.grossProfit)}</span>
              </div>

              <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800 text-emerald-600">
                <span>Plus: Delivery Fee Revenue</span>
                <span className="font-extrabold">+{formatPrice(financials.deliveryRevenue)}</span>
              </div>

              <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800 text-amber-600">
                <span>Less: Farmer Commissions Paid</span>
                <span className="font-extrabold">({formatPrice(financials.totalFarmerCommissions)})</span>
              </div>

              <div className="flex justify-between py-4 border-t-2 border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-955 text-white p-5 rounded-2xl">
                <span className="text-sm font-black uppercase tracking-wider">EQUALS: NET OPERATING PROFIT</span>
                <span className="text-xl font-black text-kaya-orange">{formatPrice(financials.netProfit)}</span>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
