"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Edit3, Type, CheckCircle, RotateCcw, ShieldCheck } from "lucide-react";

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  customerDefaultName: string;
  onSubmitProof: (proof: {
    signatureType: "DRAWN" | "TYPED";
    signatureData: string;
    proofCustomerName: string;
  }) => Promise<void>;
}

export default function DigitalSignatureModal({
  isOpen,
  onClose,
  orderNumber,
  customerDefaultName,
  onSubmitProof
}: DigitalSignatureModalProps) {
  const [activeTab, setActiveTab] = useState<"DRAWN" | "TYPED">("DRAWN");
  const [typedName, setTypedName] = useState(customerDefaultName || "");
  const [signerName, setSignerName] = useState(customerDefaultName || "");
  const [submitting, setSubmitting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === "DRAWN") {
      setTimeout(() => {
        initCanvas();
      }, 100);
    }
  }, [isOpen, activeTab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = 180;
    }

    ctx.strokeStyle = "#FF7A1A";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) {
      alert("Please provide the receiver's full name.");
      return;
    }

    let signatureData = "";
    if (activeTab === "DRAWN") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        alert("Please draw your signature on the screen or switch to Type Signature.");
        return;
      }
      signatureData = canvas.toDataURL("image/png");
    } else {
      if (!typedName.trim()) {
        alert("Please type your full name for signature.");
        return;
      }
      signatureData = typedName.trim();
    }

    setSubmitting(true);
    try {
      await onSubmitProof({
        signatureType: activeTab,
        signatureData,
        proofCustomerName: signerName.trim()
      });
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to submit signature.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-kaya-orange" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Proof of Delivery</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Confirm receipt for Order <strong className="text-slate-900 dark:text-slate-200">{orderNumber}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Receiver Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Receiver Full Name
            </label>
            <input 
              type="text" 
              required 
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="e.g. Chinedu Okafor"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
            />
          </div>

          {/* Signature Mode Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Digital Signature
              </label>
              {activeTab === "DRAWN" && (
                <button 
                  type="button" 
                  onClick={clearCanvas}
                  className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 focus:outline-none"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear Pad</span>
                </button>
              )}
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-850">
              <button
                type="button"
                onClick={() => setActiveTab("DRAWN")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "DRAWN"
                    ? "bg-white dark:bg-slate-800 text-kaya-orange shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Edit3 className="h-4 w-4" />
                <span>Draw Signature</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("TYPED")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "TYPED"
                    ? "bg-white dark:bg-slate-800 text-kaya-orange shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Type className="h-4 w-4" />
                <span>Type Full Name</span>
              </button>
            </div>

            {/* DRAWN CANVAS TAB */}
            {activeTab === "DRAWN" ? (
              <div className="bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-2 text-center relative overflow-hidden">
                <canvas 
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full bg-white dark:bg-slate-900 rounded-xl cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs font-semibold">
                    Draw your signature here with finger or mouse
                  </div>
                )}
              </div>
            ) : (
              /* TYPED TAB */
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <input 
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type signature name"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-kaya-orange/30"
                />
                {typedName && (
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Signature Preview</p>
                    <p className="text-2xl font-serif italic text-kaya-orange tracking-wide">
                      {typedName}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-kaya-orange hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 text-xs focus:outline-none disabled:opacity-50"
          >
            <CheckCircle className="h-4.5 w-4.5" />
            <span>{submitting ? "Confirming Receipt..." : "I Have Received My Order"}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
