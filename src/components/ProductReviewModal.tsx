"use client";

import React, { useState } from "react";
import { Star, X, CheckCircle2 } from "lucide-react";
import { createProductReview } from "@/app/actions/reviewActions";

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export default function ProductReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  userId,
  userName,
  onSuccess
}: ProductReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState(userName || "Verified Customer");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return alert("Please write a short review comment.");

    setSubmitting(true);
    try {
      const res = await createProductReview({
        productId,
        userId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        displayName: displayName.trim()
      });

      if (res.success) {
        alert("Thank you! Your product review has been submitted.");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        alert(res.error || "Failed to submit product review.");
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
            <span className="text-[10px] font-black uppercase text-kaya-orange tracking-widest">VERIFIED PRODUCT REVIEW</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-xs">{productName}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Rating Stars */}
          <div className="text-center space-y-2 py-2 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tap to Rate Product</label>
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
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block">{rating} out of 5 Stars</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Review Title (Optional)</label>
            <input 
              type="text"
              placeholder="e.g., Extremely Fresh & Excellent Quality!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Your Review Comments *</label>
            <textarea 
              required
              rows={3}
              placeholder="Share details about fresh quality, taste, packaging..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Display Name</label>
            <input 
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? "Submitting Review..." : "Submit Product Review"}
          </button>
        </form>

      </div>
    </div>
  );
}
