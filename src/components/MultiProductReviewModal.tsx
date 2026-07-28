"use client";

import React, { useState, useEffect } from "react";
import { Star, X, Check, Package } from "lucide-react";
import { createBatchOrderProductReviews } from "@/app/actions/reviewActions";

interface MultiProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  user: any;
  onSuccess?: () => void;
}

export default function MultiProductReviewModal({
  isOpen,
  onClose,
  order,
  user,
  onSuccess
}: MultiProductReviewModalProps) {
  const [ratingsMap, setRatingsMap] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (order && order.items) {
      const initialMap: Record<string, { rating: number; comment: string }> = {};
      order.items.forEach((item: any) => {
        if (item.productId) {
          initialMap[item.productId] = { rating: 5, comment: "" };
        }
      });
      setRatingsMap(initialMap);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleRatingChange = (productId: string, newRating: number) => {
    setRatingsMap(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating: newRating }
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setRatingsMap(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const reviewsArray = Object.entries(ratingsMap).map(([productId, val]) => ({
      productId,
      rating: val.rating,
      comment: val.comment
    }));

    try {
      const res = await createBatchOrderProductReviews({
        orderId: order.id,
        userId: user?.id || order.userId,
        displayName: user?.name || order.customerName || "Verified Customer",
        reviews: reviewsArray
      });

      if (res.success) {
        setSuccessMsg("Thank you! Your ratings have been recorded for each product in your order.");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setSuccessMsg("");
        }, 2000);
      } else {
        setErrorMsg(res.error || "Failed to submit product reviews.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while submitting reviews.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase text-kaya-orange tracking-widest">
              VERIFIED PURCHASER REVIEW
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-kaya-orange" />
              <span>Rate Products in Order #{order.orderNumber}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rate every purchased product individually to help other shoppers
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 p-4 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2">
            <Check className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 p-4 rounded-2xl text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Scrollable Products List */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 pr-2">
          {order.items.map((item: any) => {
            const pId = item.productId || item.id;
            const currentRating = ratingsMap[pId]?.rating || 5;
            const currentComment = ratingsMap[pId]?.comment || "";

            return (
              <div key={item.id} className="bg-slate-50 dark:bg-slate-955 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.productName}</h4>
                  <span className="text-xs font-bold text-kaya-orange bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-full">
                    Qty: {item.quantity}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400 uppercase mr-2">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(pId, star)}
                      className="focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= currentRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-amber-500 ml-2">{currentRating}.0 Stars</span>
                </div>

                {/* Comment Field */}
                <div>
                  <textarea
                    rows={2}
                    value={currentComment}
                    onChange={(e) => handleCommentChange(pId, e.target.value)}
                    placeholder={`Write a brief review for ${item.productName}...`}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
                  />
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-4 rounded-2xl text-xs shadow-lg transition-all"
          >
            {submitting ? "Submitting Individual Product Reviews..." : "Submit All Product Reviews"}
          </button>
        </form>

      </div>
    </div>
  );
}
