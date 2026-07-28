"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, DollarSign, Package, Users, Truck, Award, 
  BarChart3, PieChart, Activity, Printer, Download, RefreshCw,
  FileText, ShieldCheck, ArrowUpRight, ArrowDownRight, Layers
} from "lucide-react";
import { getCompleteBusinessAnalytics } from "@/app/actions/analyticsActions";
import { getFarmers, getFarmerTransactions, createOrUpdateFarmer, createFarmerTransaction } from "@/app/actions/farmerActions";
import ReportPrintModal from "@/components/ReportPrintModal";

export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [farmerTxs, setFarmerTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "SALES" | "PRODUCTS" | "FARMERS" | "RIDERS" | "INVENTORY" | "CUSTOMERS">("OVERVIEW");

  // PDF Export Modal State
  const [exportReportType, setExportReportType] = useState<string | null>(null);

  // Farmer Modal Form State
  const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [farmerCommissionRate, setFarmerCommissionRate] = useState(5.0);
  const [submittingFarmer, setSubmittingFarmer] = useState(false);

  // Farmer Transaction Form State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [txProductName, setTxProductName] = useState("");
  const [txQuantity, setTxQuantity] = useState(10);
  const [txUnitCost, setTxUnitCost] = useState(1000);
  const [submittingTx, setSubmittingTx] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [resData, resFarmers, resTxs] = await Promise.all([
        getCompleteBusinessAnalytics(),
        getFarmers(),
        getFarmerTransactions()
      ]);
      setData(resData);
      setFarmers(resFarmers);
      setFarmerTxs(resTxs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const handleSaveFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFarmer(true);
    try {
      const res = await createOrUpdateFarmer({
        name: farmerName,
        phone: farmerPhone,
        commissionRate: farmerCommissionRate
      });
      if (res.success) {
        setIsFarmerModalOpen(false);
        setFarmerName("");
        setFarmerPhone("");
        fetchAnalytics();
      } else {
        alert(res.error || "Failed to save farmer.");
      }
    } catch (err: any) {
      alert(err.message || "Error saving farmer.");
    } finally {
      setSubmittingFarmer(false);
    }
  };

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTx(true);
    try {
      const res = await createFarmerTransaction({
        farmerId: selectedFarmerId,
        productName: txProductName,
        quantity: txQuantity,
        unitCost: txUnitCost
      });
      if (res.success) {
        setIsTxModalOpen(false);
        setTxProductName("");
        fetchAnalytics();
      } else {
        alert(res.error || "Failed to record procurement transaction.");
      }
    } catch (err: any) {
      alert(err.message || "Error recording transaction.");
    } finally {
      setSubmittingTx(false);
    }
  };

  if (loading || !data || !data.sales) {
    return (
      <div className="py-32 text-center space-y-4">
        <Activity className="h-10 w-10 text-kaya-orange animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Computing Live Financial & Business Analytics...</p>
      </div>
    );
  }

  const { sales, products, customers, riders, inventory, financials } = data;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">
              Live Database Synchronization
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial & Business Profit Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time analytics engine calculating revenues, COGS, net profit, farmer commissions, and rider earnings
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchAnalytics}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setExportReportType("PROFIT")}
            className="px-5 py-3 rounded-2xl bg-kaya-orange hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Export Financial PDF Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: "OVERVIEW", label: "Financial Overview 📊" },
          { id: "SALES", label: "Sales & Revenue 💵" },
          { id: "PRODUCTS", label: "Products & COGS 📦" },
          { id: "FARMERS", label: "Farmer Procurement 🌾" },
          { id: "RIDERS", label: "Delivery & Rider Earnings 🚚" },
          { id: "INVENTORY", label: "Stock Valuation 🏭" },
          { id: "CUSTOMERS", label: "Customer LTV 👥" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-800 text-kaya-orange shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Executive Financial Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Gross Revenue</span>
          <p className="text-xl font-black text-slate-900 dark:text-white">{formatPrice(financials.grossRevenue)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Cost of Goods (COGS)</span>
          <p className="text-xl font-black text-rose-500">{formatPrice(financials.cogs)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Estimated Gross Profit</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(financials.grossProfit)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">KayaMarket Logistics Share</span>
          <p className="text-xl font-black text-kaya-orange">{formatPrice(financials.kayaMarketDeliveryEarnings)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Farmer Commissions</span>
          <p className="text-xl font-black text-amber-500">{formatPrice(financials.totalFarmerCommissions)}</p>
        </div>

        <div className="bg-gradient-to-br from-kaya-orange to-orange-600 p-5 rounded-2xl text-white space-y-1 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-100">Estimated Net Profit</span>
          <p className="text-xl font-black">{formatPrice(financials.estimatedNetProfit)}</p>
        </div>
      </div>

      {/* TAB CONTENT 1: OVERVIEW & SALES */}
      {(activeTab === "OVERVIEW" || activeTab === "SALES") && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Today's Sales</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatPrice(sales.dailySales)}</p>
              <p className="text-[10px] text-slate-500 font-semibold">Completed order volume today</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Weekly Sales</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatPrice(sales.weeklySales)}</p>
              <p className="text-[10px] text-slate-500 font-semibold">Past 7 days completed revenue</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Sales</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatPrice(sales.monthlySales)}</p>
              <p className="text-[10px] text-slate-500 font-semibold">Current month total sales</p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Export Official Sales & Revenue Report</h3>
              <p className="text-xs text-slate-400">Generate formatted executive PDF report for sales performance</p>
            </div>
            <button
              onClick={() => setExportReportType("SALES")}
              className="px-4 py-2 bg-kaya-orange text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Printer className="h-4 w-4" /> Export Sales PDF
            </button>
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: PRODUCTS & PROFITABILITY */}
      {(activeTab === "OVERVIEW" || activeTab === "PRODUCTS") && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-kaya-orange" />
              <span>Product Profitability & Unit Economics</span>
            </h3>
            <button
              onClick={() => setExportReportType("INVENTORY")}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Printer className="h-3.5 w-3.5" /> PDF Export
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-955 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-4 pl-6">Product Name</th>
                    <th className="p-4">Supplier / Farmer</th>
                    <th className="p-4">Unit Cost (COGS)</th>
                    <th className="p-4">Selling Price</th>
                    <th className="p-4">Qty Sold</th>
                    <th className="p-4">Total Revenue</th>
                    <th className="p-4 pr-6 text-right">Product Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {products.allProductStats.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white">
                        {p.name}
                        <span className="block text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{p.farmerName}</td>
                      <td className="p-4 text-rose-500 font-bold">{formatPrice(p.unitCost)}</td>
                      <td className="p-4 text-slate-900 dark:text-white font-bold">{formatPrice(p.unitPrice)}</td>
                      <td className="p-4 font-black text-kaya-orange">{p.qtySold} units</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{formatPrice(p.sellingRevenue)}</td>
                      <td className="p-4 pr-6 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatPrice(p.productProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FARMER PROCUREMENT & COMMISSIONS */}
      {(activeTab === "OVERVIEW" || activeTab === "FARMERS") && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>🌾 Farmer & Supplier Commission Records</span>
              </h3>
              <p className="text-xs text-slate-500">Track supplier purchase costs, bulk transactions, and automated commissions</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsFarmerModalOpen(true)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                + Add Farmer Profile
              </button>
              <button
                onClick={() => setIsTxModalOpen(true)}
                className="px-4 py-2 bg-kaya-orange text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                + Record Procurement TX
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Farmers List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Registered Farmers & Suppliers</h4>
              {farmers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No farmers registered yet. Click above to add a supplier.</p>
              ) : (
                <div className="space-y-3">
                  {farmers.map(f => (
                    <div key={f.id} className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{f.name}</p>
                        <p className="text-[10px] text-slate-400">{f.phone || "No Phone"} • Commission Rate: {Number(f.commissionRate)}%</p>
                      </div>
                      <span className="font-bold text-kaya-orange bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-full">
                        {f.transactions?.length || 0} Transactions
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Procurement Transactions */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Recent Procurement Transactions</h4>
              {farmerTxs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No transactions recorded yet.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {farmerTxs.map(tx => (
                    <div key={tx.id} className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">{tx.productName} ({tx.quantity} units)</span>
                        <span className="font-bold text-rose-500">{formatPrice(Number(tx.totalCost))}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>Supplier: {tx.farmer?.name}</span>
                        <span className="text-amber-500 font-bold">Commission: {formatPrice(Number(tx.commission))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT 4: DELIVERY & RIDER EARNINGS (Requirement 8) */}
      {(activeTab === "OVERVIEW" || activeTab === "RIDERS") && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-kaya-orange" />
              <span>Delivery Fee & Rider Earnings Breakdown (Requirement 8)</span>
            </h3>
            <button
              onClick={() => setExportReportType("DELIVERY")}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Printer className="h-3.5 w-3.5" /> PDF Delivery Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Delivery Fees Billed</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatPrice(riders.deliveryRevenue)}</p>
              <p className="text-[10px] text-slate-500 font-semibold">₦4,000 per completed delivery</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Rider Earnings Paid</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(riders.riderEarningsTotal)}</p>
              <p className="text-[10px] text-slate-500 font-semibold">₦2,000 per completed delivery to rider</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">KayaMarket Delivery Profit</span>
              <p className="text-2xl font-black text-kaya-orange">{formatPrice(riders.kayaMarketDeliveryEarnings)}</p>
              <p className="text-[10px] text-slate-500 font-semibold">₦2,000 retained per delivery</p>
            </div>
          </div>
        </div>
      )}

      {/* FARMER MODAL FORM */}
      {isFarmerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 w-full max-w-md space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-white">Add Farmer / Supplier Profile</h3>
            <form onSubmit={handleSaveFarmer} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-slate-400 block mb-1">Farmer Name</label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={e => setFarmerName(e.target.value)}
                  placeholder="e.g. Alhaji Musa Farmers Coop"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={farmerPhone}
                  onChange={e => setFarmerPhone(e.target.value)}
                  placeholder="+234 803 445 1122"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={farmerCommissionRate}
                  onChange={e => setFarmerCommissionRate(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFarmerModalOpen(false)}
                  className="w-1/2 p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFarmer}
                  className="w-1/2 p-3 bg-kaya-orange text-white rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROCUREMENT TX MODAL FORM */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 w-full max-w-md space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-white">Record Farmer Purchase Transaction</h3>
            <form onSubmit={handleSaveTx} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-slate-400 block mb-1">Select Supplier / Farmer</label>
                <select
                  required
                  value={selectedFarmerId}
                  onChange={e => setSelectedFarmerId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800"
                >
                  <option value="">-- Select Farmer --</option>
                  {farmers.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={txProductName}
                  onChange={e => setTxProductName(e.target.value)}
                  placeholder="e.g. Ofada Rice 50kg Bag"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={txQuantity}
                    onChange={e => setTxQuantity(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Unit Cost (₦)</label>
                  <input
                    type="number"
                    required
                    value={txUnitCost}
                    onChange={e => setTxUnitCost(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="w-1/2 p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTx}
                  className="w-1/2 p-3 bg-kaya-orange text-white rounded-xl"
                >
                  Save TX
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF PRINT MODAL GENERATOR FOR ALL REPORTS (Requirement 10) */}
      {exportReportType && (
        <ReportPrintModal
          isOpen={!!exportReportType}
          onClose={() => setExportReportType(null)}
          title={`KayaMarket Official ${exportReportType} Executive Report`}
          subtitle="Real-Time Database Audit & Performance Statement"
          dataSummary={[
            { label: "Report Type", value: exportReportType },
            { label: "Gross Billed", value: formatPrice(financials.grossRevenue) },
            { label: "Net Profit", value: formatPrice(financials.estimatedNetProfit) },
            { label: "Audit Date", value: new Date().toLocaleDateString() }
          ]}
        >
          {exportReportType === "PROFIT" || exportReportType === "SALES" ? (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Financial Profit & Loss Statement</h3>
              <table className="w-full text-xs border">
                <thead className="bg-slate-100 font-bold border-b">
                  <tr>
                    <th className="p-2 text-left">Financial Metric</th>
                    <th className="p-2 text-right">Amount (NGN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="p-2 font-semibold">Gross Sales Revenue</td><td className="p-2 text-right font-bold">{formatPrice(financials.grossRevenue)}</td></tr>
                  <tr><td className="p-2 font-semibold">Cost of Goods Sold (COGS)</td><td className="p-2 text-right text-rose-600 font-bold">-{formatPrice(financials.cogs)}</td></tr>
                  <tr><td className="p-2 font-bold">Gross Profit</td><td className="p-2 text-right text-emerald-600 font-bold">{formatPrice(financials.grossProfit)}</td></tr>
                  <tr><td className="p-2 font-semibold">KayaMarket Delivery Profit (₦2,000/del)</td><td className="p-2 text-right text-kaya-orange font-bold">+{formatPrice(financials.kayaMarketDeliveryEarnings)}</td></tr>
                  <tr><td className="p-2 font-semibold">Farmer Commissions Paid</td><td className="p-2 text-right text-amber-600 font-bold">-{formatPrice(financials.totalFarmerCommissions)}</td></tr>
                  <tr className="bg-slate-100 font-black"><td className="p-2">ESTIMATED NET PROFIT</td><td className="p-2 text-right text-slate-900">{formatPrice(financials.estimatedNetProfit)}</td></tr>
                </tbody>
              </table>
            </div>
          ) : exportReportType === "DELIVERY" ? (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Delivery & Rider Logistics Statement</h3>
              <table className="w-full text-xs border">
                <thead className="bg-slate-100 font-bold border-b">
                  <tr>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr><td className="p-2 font-semibold">Total Completed Deliveries</td><td className="p-2 text-right font-bold">{riders.totalCompletedDeliveries}</td></tr>
                  <tr><td className="p-2 font-semibold">Customer Delivery Revenue Billed</td><td className="p-2 text-right font-bold">{formatPrice(riders.deliveryRevenue)}</td></tr>
                  <tr><td className="p-2 font-semibold">Rider Earnings Disbursed</td><td className="p-2 text-right text-emerald-600 font-bold">{formatPrice(riders.riderEarningsTotal)}</td></tr>
                  <tr><td className="p-2 font-bold">KayaMarket Delivery Profit Retained</td><td className="p-2 text-right text-kaya-orange font-bold">{formatPrice(riders.kayaMarketDeliveryEarnings)}</td></tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Inventory Stock Valuation</h3>
              <table className="w-full text-xs border">
                <thead className="bg-slate-100 font-bold border-b">
                  <tr>
                    <th className="p-2 text-left">Product Name</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-right">Selling Price</th>
                    <th className="p-2 text-right">Stock Qty</th>
                    <th className="p-2 text-right">Stock Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.allProductStats.map((p: any) => (
                    <tr key={p.id}>
                      <td className="p-2 font-bold">{p.name}</td>
                      <td className="p-2">{p.categoryName}</td>
                      <td className="p-2 text-right">{formatPrice(p.unitPrice)}</td>
                      <td className="p-2 text-right font-bold">{p.inventory}</td>
                      <td className="p-2 text-right font-bold">{formatPrice(p.inventory * p.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ReportPrintModal>
      )}

    </div>
  );
}
