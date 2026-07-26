"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, Trash2, Star, ArrowLeft, ArrowRight, 
  UploadCloud, Sparkles, Crop, Loader2, Check, X, Sliders
} from "lucide-react";

interface MediaManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  productName: string;
  categorySlug: string;
}

export default function MediaManager({ images, onChange, productName, categorySlug }: MediaManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiResultUrl, setAiResultUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageIndex, setCropImageIndex] = useState<number | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  
  // Crop states
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [cropping, setCropping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Generate default AI prompt based on name
  useEffect(() => {
    if (productName) {
      const lowerName = productName.toLowerCase();
      let detail = `Fresh ${lowerName}`;
      
      if (lowerName.includes("chicken") || lowerName.includes("broiler")) {
        detail = "Fresh whole broiler chicken on a clean white background";
      } else if (lowerName.includes("catfish")) {
        detail = "Fresh whole catfish";
      } else if (lowerName.includes("titus")) {
        detail = "Fresh Titus fish";
      } else if (lowerName.includes("rice")) {
        detail = "Premium bag of long grain rice";
      } else if (lowerName.includes("garri")) {
        detail = "Bowl of clean white garri";
      } else if (lowerName.includes("yam")) {
        detail = "Fresh yam tubers";
      } else if (lowerName.includes("palm oil")) {
        detail = "Bottle of red palm oil";
      } else if (lowerName.includes("tomato")) {
        detail = "Fresh ripe tomatoes";
      } else if (lowerName.includes("pepper")) {
        detail = "Fresh red peppers";
      } else if (lowerName.includes("onion")) {
        detail = "Fresh onions";
      } else if (lowerName.includes("plantain")) {
        detail = "Fresh plantain bunch";
      } else if (lowerName.includes("banana")) {
        detail = "Fresh yellow bananas";
      } else if (lowerName.includes("orange")) {
        detail = "Fresh ripe oranges";
      } else if (lowerName.includes("beans")) {
        detail = "Bowl of raw brown beans";
      }
      
      setAiPrompt(`${detail}, studio quality, realistic, ecommerce marketplace product photography, clean background`);
    }
  }, [productName, showAiModal]);

  // Redraw canvas for crop preview
  useEffect(() => {
    if (showCropModal && cropImageSrc && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageRef.current = img;
        drawCropCanvas();
      };
      img.src = cropImageSrc;
    }
  }, [showCropModal, cropImageSrc, zoom, panX, panY]);

  const drawCropCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgRatio = img.width / img.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (imgRatio > 1) {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgRatio;
    } else {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  };

  // Upload to Cloudinary helper
  const uploadToCloudinary = async (fileOrUrl: File | string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", fileOrUrl);
    formData.append("upload_preset", "primewealth_kyc");

    const res = await fetch(`https://api.cloudinary.com/v1_1/qhmu5zob/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }
    return data.secure_url;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
      }

      onChange([...images, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || "Failed to upload image(s)");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGenerateAiImage = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setError(null);
    setAiResultUrl(null);

    try {
      const seed = Math.floor(Math.random() * 1000000);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=800&height=800&nologo=true&seed=${seed}`;
      
      // Pre-load the image to make sure it exists/loads successfully
      const img = new Image();
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      setAiResultUrl(url);
    } catch (err: any) {
      setError("AI generation failed or timed out. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApproveAiImage = async () => {
    if (!aiResultUrl) return;
    setAiGenerating(true);
    setError(null);

    try {
      // Direct upload from Pollinations remote URL to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(aiResultUrl);
      onChange([...images, cloudinaryUrl]);
      setShowAiModal(false);
      setAiResultUrl(null);
    } catch (err: any) {
      setError(err.message || "Failed to save AI image to Cloudinary");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas || cropImageIndex === null) return;

    setCropping(true);
    setError(null);

    try {
      // Export canvas as base64 data URL
      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
      
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(croppedDataUrl);
      
      const newImages = [...images];
      newImages[cropImageIndex] = cloudinaryUrl;
      onChange(newImages);
      
      setShowCropModal(false);
      setCropImageIndex(null);
      setCropImageSrc(null);
    } catch (err: any) {
      setError(err.message || "Failed to apply crop and upload");
    } finally {
      setCropping(false);
    }
  };

  const handleDelete = (index: number) => {
    const newImages = images.filter((_, idx) => idx !== index);
    onChange(newImages);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    onChange(newImages);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const newImages = [...images];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload/Generate Panel */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 min-w-[150px] bg-slate-50 border border-slate-200 hover:bg-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all focus:outline-none"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-kaya-orange animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6 text-slate-500" />
          )}
          <span className="text-xs font-bold text-slate-700">Upload Real Photo</span>
          <span className="text-[10px] text-slate-400">JPG, PNG, WEBP</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setShowAiModal(true);
          }}
          className="flex-1 min-w-[150px] bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 hover:from-orange-100 hover:to-amber-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all focus:outline-none"
        >
          <Sparkles className="w-6 h-6 text-kaya-orange animate-pulse" />
          <span className="text-xs font-bold text-kaya-orange">Generate using AI</span>
          <span className="text-[10px] text-amber-600">Studio quality product image</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
          {images.map((url, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-2xl overflow-hidden border bg-slate-50 group flex flex-col justify-between transition-all ${
                idx === 0 ? "border-kaya-orange ring-2 ring-kaya-orange/10" : "border-slate-200"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-square w-full overflow-hidden bg-white border-b border-slate-100">
                <img src={url} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-kaya-orange text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full z-10 shadow-sm flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-white" /> Primary
                  </span>
                )}

                {/* Quick overlay controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setPanX(0);
                      setPanY(0);
                      setCropImageIndex(idx);
                      setCropImageSrc(url);
                      setShowCropModal(true);
                    }}
                    title="Crop image"
                    className="bg-white/90 hover:bg-kaya-orange hover:text-white p-2 rounded-xl text-slate-800 transition-colors shadow-md"
                  >
                    <Crop className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    title="Delete image"
                    className="bg-white/90 hover:bg-rose-500 hover:text-white p-2 rounded-xl text-slate-800 transition-colors shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom bar control buttons */}
              <div className="p-2 bg-white flex items-center justify-between gap-1 text-[10px]">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleSetPrimary(idx)}
                  className={`px-2 py-1 rounded-md font-bold transition-all ${
                    idx === 0 
                      ? "text-kaya-orange cursor-default" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  {idx === 0 ? "Primary" : "Set Primary"}
                </button>
                
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "left")}
                    className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 border border-slate-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, "right")}
                    className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 border border-slate-200"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[3rem] shadow-2xl max-w-lg w-full relative animate-in zoom-in duration-200 text-slate-800">
            <button 
              onClick={() => {
                setShowAiModal(false);
                setAiResultUrl(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-kaya-orange" />
              <h3 className="text-xl font-black text-slate-900">AI Product Image Generator</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Image Generation Prompt</label>
                <textarea 
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 font-semibold leading-relaxed"
                  placeholder="Describe the product image..."
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAiImage}
                disabled={aiGenerating}
                className="w-full bg-kaya-orange hover:bg-orange-600 disabled:bg-slate-200 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 focus:outline-none transition-all"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Studio Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Image</span>
                  </>
                )}
              </button>

              {/* Result Preview */}
              {aiResultUrl && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">AI Image Generated Preview</p>
                  <div className="relative aspect-square w-64 mx-auto rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-md">
                    <img src={aiResultUrl} alt="Generated result" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleGenerateAiImage}
                      disabled={aiGenerating}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-xl text-xs"
                    >
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveAiImage}
                      disabled={aiGenerating}
                      className="px-5 py-2 bg-kaya-orange hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/10"
                    >
                      {aiGenerating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Approve & Save</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[3rem] shadow-2xl max-w-lg w-full relative animate-in zoom-in duration-200 text-slate-800">
            <button 
              onClick={() => {
                setShowCropModal(false);
                setCropImageIndex(null);
                setCropImageSrc(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Crop className="w-5 h-5 text-kaya-orange" />
              <h3 className="text-xl font-black text-slate-900">Crop Product Image</h3>
            </div>

            <div className="space-y-6">
              {/* Canvas Preview */}
              <div className="relative aspect-square w-64 mx-auto rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  width={400} 
                  height={400} 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 border-4 border-dashed border-white/50 pointer-events-none rounded-2xl"></div>
              </div>

              {/* Adjustments */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-700">Crop Adjustments</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Zoom: {zoom.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={3} 
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-kaya-orange cursor-pointer bg-slate-200 h-1.5 rounded"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Pan Horizontal: {panX}px</span>
                  </div>
                  <input 
                    type="range" 
                    min={-150} 
                    max={150} 
                    step={1}
                    value={panX}
                    onChange={(e) => setPanX(parseInt(e.target.value))}
                    className="w-full accent-kaya-orange cursor-pointer bg-slate-200 h-1.5 rounded"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Pan Vertical: {panY}px</span>
                  </div>
                  <input 
                    type="range" 
                    min={-150} 
                    max={150} 
                    step={1}
                    value={panY}
                    onChange={(e) => setPanY(parseInt(e.target.value))}
                    className="w-full accent-kaya-orange cursor-pointer bg-slate-200 h-1.5 rounded"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPanX(0);
                    setPanY(0);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold rounded-xl text-xs"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  disabled={cropping}
                  className="px-5 py-2 bg-kaya-orange hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/10 animate-pulse"
                >
                  {cropping ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Apply Crop</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
