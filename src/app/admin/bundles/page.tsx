"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, Plus, Edit, Trash2, Eye, EyeOff, Check, X, Sparkles, Tag, 
  ArrowUp, ArrowDown, Image as ImageIcon, ShoppingBag, Layers
} from "lucide-react";
import { 
  getComboBundles, createComboBundle, updateComboBundle, 
  deleteComboBundle, toggleBundleVisibility 
} from "@/app/actions/bundleActions";
import { getProducts } from "@/app/actions/productActions";

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [discountPercentage, setDiscountPercentage] = useState<number | "">(0);
  const [image, setImage] = useState("");
  const [includedProductsInput, setIncludedProductsInput] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isVisible, setIsVisible] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);

  const compressImage = (file: File, maxWidth = 800, quality = 0.75): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "primewealth_kyc");

      const res = await fetch("https://api.cloudinary.com/v1_1/qhmu5zob/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.secure_url) {
        setImage(data.secure_url);
      } else {
        const compressed = await compressImage(file);
        setImage(compressed);
      }
    } catch (err) {
      console.warn("Cloudinary upload failed, using compressed fallback:", err);
      try {
        const compressed = await compressImage(file);
        setImage(compressed);
      } catch (e) {
        alert("Failed to process image file.");
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, pData] = await Promise.all([
        getComboBundles(),
        getProducts()
      ]);
      setBundles(bData);
      setAvailableProducts(pData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setDiscountPercentage(0);
    setImage("https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60");
    setIncludedProductsInput("");
    setDisplayOrder(bundles.length + 1);
    setIsVisible(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: any) => {
    setEditingId(b.id);
    setName(b.name);
    setDescription(b.description);
    setPrice(b.price);
    setOriginalPrice(b.originalPrice || "");
    setDiscountPercentage(b.discountPercentage || 0);
    setImage(b.image);
    setIncludedProductsInput(Array.isArray(b.includedProducts) ? b.includedProducts.join(", ") : "");
    setDisplayOrder(b.displayOrder || 1);
    setIsVisible(b.isVisible);
    setIsModalOpen(true);
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || price === "") {
      alert("Please fill in bundle name, description and price.");
      return;
    }

    setSaving(true);
    const parsedProducts = includedProductsInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const payload = {
        name,
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
        image: image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60",
        includedProducts: parsedProducts,
        displayOrder: Number(displayOrder),
        isVisible
      };

      if (editingId) {
        const res = await updateComboBundle(editingId, payload);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createComboBundle(payload);
        if (!res.success) throw new Error(res.error);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save combo bundle.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this combo bundle?")) return;
    try {
      const res = await deleteComboBundle(id);
      if (res.success) {
        await loadData();
      } else {
        alert(res.error || "Failed to delete bundle.");
      }
    } catch (e: any) {
      alert(e.message || "Failed to delete bundle.");
    }
  };

  const handleToggleVisibility = async (id: string, currentVal: boolean) => {
    try {
      const res = await toggleBundleVisibility(id, !currentVal);
      if (res.success) {
        setBundles(prev => prev.map(b => b.id === id ? { ...b, isVisible: !currentVal } : b));
      }
    } catch (e: any) {
      alert(e.message || "Failed to toggle visibility.");
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-orange-50 dark:bg-orange-950/40 text-kaya-orange px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-900/40">
            <Layers className="h-3.5 w-3.5" />
            <span>Storefront Combo Baskets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Manage Combo Bundles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, price, and curate special foodstuff bundles displayed on the public storefront.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-orange-500/25 transition-all text-xs flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Combo Bundle</span>
        </button>
      </div>

      {/* Bundles Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <Package className="h-10 w-10 text-kaya-orange animate-bounce mx-auto" />
          <p className="text-sm font-bold text-slate-500">Loading Combo Bundles...</p>
        </div>
      ) : bundles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-16 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <Layers className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">No combo bundles available</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
            Click the button above to create your first Kaya Combo Basket.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bundles.map((bundle) => (
            <div 
              key={bundle.id}
              className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border ${
                bundle.isVisible 
                  ? "border-slate-200 dark:border-slate-800" 
                  : "border-slate-300 dark:border-slate-800 opacity-60 bg-slate-50/50"
              } p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group`}
            >
              <div className="space-y-4">
                {/* Image and badges */}
                <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                  <img 
                    src={bundle.image} 
                    alt={bundle.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Order #{bundle.displayOrder}
                    </span>
                    {bundle.discountPercentage > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        -{bundle.discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleVisibility(bundle.id, bundle.isVisible)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                      bundle.isVisible 
                        ? "bg-emerald-500 text-white" 
                        : "bg-slate-800 text-slate-400"
                    }`}
                    title={bundle.isVisible ? "Visible on Storefront" : "Hidden from Storefront"}
                  >
                    {bundle.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white line-clamp-1">
                    {bundle.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {bundle.description}
                  </p>
                </div>

                {/* Included items tags */}
                {Array.isArray(bundle.includedProducts) && bundle.includedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {bundle.includedProducts.map((prod: string, idx: number) => (
                      <span 
                        key={idx}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        {prod}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  {bundle.originalPrice && (
                    <span className="text-[11px] text-slate-400 line-through block font-medium">
                      {formatPrice(bundle.originalPrice)}
                    </span>
                  )}
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {formatPrice(bundle.price)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(bundle)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-kaya-orange hover:text-white transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(bundle.id)}
                    className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors border border-rose-200 dark:border-rose-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-955/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {editingId ? "Edit Combo Bundle" : "Create New Combo Bundle"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure package details, items included, discount pricing, and storefront display.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBundle} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Bundle Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Kaya Family Food Basket"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Description</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Detailed breakdown of foodstuffs in this bundle package..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Bundle Price (₦)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="45000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Original Price (₦)</label>
                  <input 
                    type="number" 
                    placeholder="52000"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Discount (% OFF)</label>
                  <input 
                    type="number" 
                    placeholder="15"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-400 uppercase text-[10px] block">Bundle Image Upload & Preview</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {image ? (
                    <div className="relative h-24 w-32 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      <img src={image} alt="Bundle Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors"
                        title="Delete image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 shrink-0 border border-dashed border-slate-300 dark:border-slate-700">
                      <ImageIcon className="h-6 w-6 mb-1" />
                      <span className="text-[10px]">No image</span>
                    </div>
                  )}

                  <div className="space-y-2 flex-1 w-full">
                    <label className={`cursor-pointer inline-flex items-center gap-2 bg-slate-900 dark:bg-kaya-orange hover:bg-kaya-orange text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${uploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>{uploadingImage ? "Uploading Image..." : image ? "Change Image File" : "Upload Image File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file);
                          }
                        }}
                      />
                    </label>
                    
                    <input 
                      type="text" 
                      placeholder="Or paste image URL (https://...)"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400 uppercase text-[10px]">Included Products (Comma Separated)</label>
                <input 
                  type="text" 
                  placeholder="Rice (10kg), Beans (5kg), Garri (5kg), Yam (2 tubers)"
                  value={includedProductsInput}
                  onChange={(e) => setIncludedProductsInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px]">Display Order Position</label>
                  <input 
                    type="number" 
                    required
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-3.5 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-white">
                    <input 
                      type="checkbox" 
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="rounded text-kaya-orange focus:ring-kaya-orange h-4 w-4"
                    />
                    <span>Visible on Storefront</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-kaya-orange hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all"
                >
                  {saving ? "Saving..." : editingId ? "Update Bundle" : "Create Bundle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
