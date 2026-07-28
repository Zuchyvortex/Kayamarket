"use client";

import React, { useState, useEffect } from "react";
import { 
  Award, Star, MessageSquare, Plus, FileText, CheckCircle, 
  XCircle, Truck, Clock, ShieldCheck, UserCheck, X
} from "lucide-react";
import { getRiderReviews, addRiderRemark, getRiderRemarks } from "@/app/actions/reviewActions";

interface RiderPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  rider: any;
}

export default function RiderPerformanceModal({
  isOpen,
  onClose,
  rider
}: RiderPerformanceModalProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ averageRating: 5.0, totalReviews: 0, performanceBadge: "" });
  const [loading, setLoading] = useState(true);

  // New Remark Form State
  const [remarkType, setRemarkType] = useState<"COMMENDATION" | "IMPROVEMENT" | "NOTE">("COMMENDATION");
  const [remarkContent, setRemarkContent] = useState("");
  const [submittingRemark, setSubmittingRemark] = useState(false);

  useEffect(() => {
    if (rider) {
      fetchPerformanceData();
    }
  }, [rider]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const [revData, remData] = await Promise.all([
        getRiderReviews(rider.id),
        getRiderRemarks(rider.id)
      ]);
      setReviews(revData.reviews || []);
      setStats({
        averageRating: revData.averageRating,
        totalReviews: revData.totalReviews,
        performanceBadge: revData.performanceBadge
      });
      setRemarks(remData || []);
    } catch (e) {
      console.error(e);
    } fontally: {
      setLoading(false);
    }
  };

  if (!isOpen || !rider) return null;

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkContent.trim()) return;

    setSubmittingRemark(true);
    try {
      const res = await addRiderRemark(rider.id, remarkType, remarkContent);
      if (res.success) {
        setRemarkContent("");
        const updatedRemarks = await getRiderRemarks(rider.id);
        setRemarks(updatedRemarks);
      } else {
        alert(res.error || "Failed to add remark.");
      }
    } catch (err: any) {
      alert(err.message || "Error adding remark.");
    } finally {
      setSubmittingRemark(false);
    }
  };

  const completedCount = rider.orders?.filter((o: any) => o.status === "COMPLETED" || o.status === "DELIVERED").length || 0;
  const cancelledCount = rider.orders?.filter((o: any) => o.status === "CANCELLED").length || 0;
  const totalDeliveries = rider.orders?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={rider.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rider.riderId}`}
              alt={rider.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-kaya-orange shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-slate-900 text-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  INTERNAL ADMIN AUDIT
                </span>
                <span className="text-xs font-bold text-kaya-orange font-mono">{rider.riderId}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{rider.fullName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {rider.vehicleType} ({rider.vehicleRegistration}) • {rider.phoneNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Performance Tag Badge */}
        <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <Award className="h-7 w-7 text-kaya-orange shrink-0" />
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Automated Performance Tag</span>
              <p className="text-base font-black text-slate-900 dark:text-white">{stats.performanceBadge}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Avg Rating</span>
              <span className="text-base font-black text-amber-500 flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{stats.averageRating} / 5.0</span>
              </span>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Deliveries</span>
            <p className="text-lg font-black text-slate-900 dark:text-white">{totalDeliveries}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Completed</span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Cancelled</span>
            <p className="text-lg font-black text-rose-500">{cancelledCount}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Customer Reviews</span>
            <p className="text-lg font-black text-kaya-orange">{stats.totalReviews}</p>
          </div>
        </div>

        {/* Main Tabs / Sections Container */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          
          {/* Admin Remark Form */}
          <form onSubmit={handleAddRemark} className="bg-slate-50 dark:bg-slate-955 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Add Commendation / Improvement Remark / Internal Note
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "COMMENDATION", label: "Commendation 🎉" },
                { type: "IMPROVEMENT", label: "Improvement Remark ⚠️" },
                { type: "NOTE", label: "Internal Note 📝" }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setRemarkType(item.type as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    remarkType === item.type
                      ? "bg-kaya-orange text-white border-kaya-orange"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={remarkContent}
              onChange={(e) => setRemarkContent(e.target.value)}
              placeholder="Enter remark details for this rider..."
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingRemark}
                className="px-5 py-2 bg-kaya-orange text-white font-bold text-xs rounded-xl shadow-md"
              >
                {submittingRemark ? "Saving Remark..." : "Save Admin Remark"}
              </button>
            </div>
          </form>

          {/* Admin Remarks Log */}
          {remarks.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Admin Remarks History
              </h4>
              <div className="space-y-2">
                {remarks.map(rem => (
                  <div key={rem.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-start text-xs">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase mb-1 ${
                        rem.type === "COMMENDATION" ? "bg-emerald-50 text-emerald-600" :
                        rem.type === "IMPROVEMENT" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                      }`}>
                        {rem.type}
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white">{rem.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(rem.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Customer Feedback */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Customer Ratings & Feedback ({reviews.length})
            </h4>
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No customer reviews submitted yet for this rider.</p>
            ) : (
              <div className="space-y-2">
                {reviews.map(rev => (
                  <div key={rev.id} className="bg-slate-50 dark:bg-slate-955 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rev.user?.firstName ? `${rev.user.firstName} ${rev.user.lastName}` : "Customer"}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`h-3.5 w-3.5 ${star <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                        ))}
                      </div>
                    </div>
                    {rev.comment && <p className="text-slate-600 dark:text-slate-300 font-medium">{rev.comment}</p>}
                    {rev.deliveryExperience && (
                      <p className="text-[10px] text-kaya-orange font-bold">Tag: {rev.deliveryExperience}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
