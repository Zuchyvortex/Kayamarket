"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  defaultImage?: string;
}

export default function ImageUploader({ onUpload, defaultImage }: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(defaultImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    // Use unsigned preset "primewealth_kyc" or "kayamarket_preset"
    // Since I don't know the preset, let me just assume "kayamarket_preset"
    // Wait, the conversation summary said: "provided Cloudinary credentials (`qhmu5zob` and `primewealth_kyc`)."
    // So the preset is "primewealth_kyc".
    formData.append("upload_preset", "primewealth_kyc"); 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/qhmu5zob/image/upload`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        setImage(data.secure_url);
        onUpload(data.secure_url);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {image ? (
        <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-200">
          <img src={image} alt="Uploaded" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={() => {
              setImage(null);
              onUpload("");
            }}
            className="absolute top-2 right-2 bg-black/50 hover:bg-rose-500 text-white p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 hover:border-kaya-orange transition-all max-w-sm flex flex-col items-center justify-center"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-kaya-orange animate-spin" />
              <span className="text-xs font-bold text-slate-500">Uploading...</span>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-600">Click or drag image to upload</p>
              <p className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, WEBP</p>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}
      {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
    </div>
  );
}
