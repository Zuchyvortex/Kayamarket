"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getProducts, getCategories, createProduct, deleteProduct, updateProduct } from "@/app/actions/productActions";
import { Search, Plus, Trash2, X, Loader2, Edit } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

export default function AdminProductsManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Modal / Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState("");
  const [categorySlug, setCategorySlug] = useState("rice");
  const [weight, setWeight] = useState("");
  const [sku, setSku] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  const fetchData = () => {
    startTransition(() => {
      Promise.all([getProducts(), getCategories()]).then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
        if (cats.length > 0 && !categorySlug) setCategorySlug(cats[0].slug);
        setLoading(false);
      });
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setInventory("");
    setSku("");
    setWeight("");
    setImage("");
    setIsActive(true);
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsNewArrival(false);
    setShowAddForm(false);
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(product.price.toString());
    setInventory(product.inventory.toString());
    setCategorySlug(product.categorySlug);
    setSku(product.sku || "");
    setWeight(product.weight || "");
    setImage(product.image || "");
    setIsActive(product.isActive ?? true);
    setIsFeatured(product.isFeatured ?? false);
    setIsBestSeller(product.isBestSeller ?? false);
    setIsNewArrival(product.isNewArrival ?? false);
    setShowAddForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && price && inventory) {
      const productData = {
        name,
        slug: name.toLowerCase().replace(/ /g, "-"),
        description,
        price: Number(price),
        inventory: Number(inventory),
        categorySlug,
        sku: sku || `SKU-${Date.now()}`,
        weight,
        images: image,
        isActive,
        isFeatured,
        isBestSeller,
        isNewArrival
      };

      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await createProduct(productData);
      }
      
      resetForm();
      fetchData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      fetchData();
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.categorySlug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="space-y-10 bg-slate-50 text-[#111111]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Inventory Console</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Products Manager</h1>
          <p className="text-slate-500 text-xs">Manage KayaMarket inventory items, track stocks and update prices</p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-orange-500/10 focus:outline-none transition-all duration-300"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters Bar - Styled for bright light background */}
      <div className="bg-white border border-slate-200 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:border-kaya-orange transition-colors font-semibold"
          />
        </div>

        <div className="flex gap-4">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table - Bright white base layout */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Weight</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-750">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-kaya-orange animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-200">
                      <img src={p.image || "/w-1.png"} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 max-w-[200px] truncate">{p.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {p.isActive ? "Active" : "Disabled"} {p.isFeatured && "• Featured"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{p.sku}</td>
                  <td className="px-6 py-4 text-slate-500 capitalize">{p.categorySlug}</td>
                  <td className="px-6 py-4 text-slate-500">{p.weight || "Pack"}</td>
                  <td className="px-6 py-4 font-black text-slate-900">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`font-black ${p.inventory < 10 ? "text-rose-600" : "text-kaya-green"}`}>
                      {p.inventory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-2.5 text-slate-400 hover:text-kaya-orange hover:bg-orange-50 rounded-xl transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal Overlay - Clean Light Layout */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[3rem] shadow-2xl max-w-lg w-full relative animate-in zoom-in duration-200 text-slate-800">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-3">Add New Foodstuff</h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-semibold max-h-[70vh] overflow-y-auto px-1 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-slate-450 font-bold uppercase tracking-wider">Product Image</label>
                  <ImageUploader defaultImage={image} onUpload={setImage} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-slate-450 font-bold uppercase tracking-wider">Product Name</label>
                  <input 
                    type="text" required placeholder="e.g. Kaya Yellow Garri (25kg)"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-bold uppercase tracking-wider">Price (NGN)</label>
                  <input 
                    type="number" required placeholder="e.g. 24000"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-bold uppercase tracking-wider">Stock Inventory</label>
                  <input 
                    type="number" required placeholder="e.g. 50"
                    value={inventory} onChange={(e) => setInventory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-455 font-bold uppercase tracking-wider">Category</label>
                  <select 
                    value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none font-bold capitalize"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                    {/* Fallbacks if empty */}
                    {categories.length === 0 && <option value="rice">Rice</option>}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-450 font-bold uppercase tracking-wider">SKU</label>
                  <input 
                    type="text" placeholder="e.g. GARI-003"
                    value={sku} onChange={(e) => setSku(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-slate-450 font-bold uppercase tracking-wider">Weight Specification</label>
                  <input 
                    type="text" placeholder="e.g. 20kg"
                    value={weight} onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-slate-450 font-bold uppercase tracking-wider">Description</label>
                  <textarea 
                    rows={3} placeholder="Provide details about the foodstuff..."
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                  ></textarea>
                </div>
                
                {/* Flags */}
                <div className="col-span-2 grid grid-cols-2 gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-kaya-orange focus:ring-kaya-orange w-4 h-4" />
                    <span className="text-slate-700">Active (Visible)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded text-kaya-orange focus:ring-kaya-orange w-4 h-4" />
                    <span className="text-slate-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="rounded text-kaya-orange focus:ring-kaya-orange w-4 h-4" />
                    <span className="text-slate-700">Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="rounded text-kaya-orange focus:ring-kaya-orange w-4 h-4" />
                    <span className="text-slate-700">New Arrival</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2 sticky bottom-0 bg-white">
                <button 
                  type="button" onClick={resetForm}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-kaya-orange hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10"
                >
                  {editingId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
