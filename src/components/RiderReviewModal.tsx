"use client";

import React, { useState } from "react";
import { Star, X, Truck, ShieldCheck } from "lucide-react";
import { createRiderReview } from "@/app/actions/reviewActions";

interface RiderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  riderName: string;
  userId: string;
  onSuccess?: () => void;
}

export default function RiderReviewModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  riderName,
  userId,
  onSuccess
}: RiderReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [deliveryExperience, setDeliveryExperience] = useState("Prompt & Professional");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createRiderReview({
        orderId,
        userId,
        rating,
        deliveryExperience,
        comment: comment.trim() || undefined
      });

      if (res.success) {
        alert("Thank you! Your feedback for the delivery rider has been saved.");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        alert(res.error || "Failed to submit rider review.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
        
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-kaya-orange tracking-widest flex items-center gap-1">
              <Truck className="h-3.5 w-3.5" />
              <span>DISPATCH RIDER RATING</span>
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Rate Rider: {riderName}</h3>
            <p className="text-xs text-slate-400">Order #{orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Star Rating */}
          <div className="text-center space-y-2 py-3 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Overall Delivery Rating</label>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-400 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 ${
                      (hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block">{rating} Stars Delivery</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Experience Tag</label>
            <select
              value={deliveryExperience}
              onChange={(e) => setDeliveryExperience(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
            >
              <option value="Prompt & Professional">Prompt & Professional</option>
              <option value="Careful Handling & Fresh Delivery">Careful Handling & Fresh Delivery</option>
              <option value="Polite & Great Communication">Polite & Great Communication</option>
              <option value="On-Time Arrival">On-Time Arrival</option>
              <option value="Needs Improvement">Needs Improvement</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Comments (Optional)</label>
            <textarea 
              rows={3}
              placeholder="Tell us about your experience with the dispatch rider..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? "Saving Feedback..." : "Submit Rider Rating"}
          </button>
        </form>

      </div>
    </div>
  );
}
