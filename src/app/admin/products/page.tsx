"use client";

import React, { useState } from "react";
import { PRODUCTS, CATEGORIES, Product } from "@/lib/mockData";
import { Search, Plus, Trash2, Edit3, X, SlidersHorizontal } from "lucide-react";

export default function AdminProductsManager() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Modal / Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState("");
  const [categorySlug, setCategorySlug] = useState("rice");
  const [weight, setWeight] = useState("");
  const [sku, setSku] = useState("");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && price && inventory) {
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/ /g, "-"),
        description,
        price: Number(price),
        inventory: Number(inventory),
        categorySlug,
        sku: sku || `SKU-${Date.now()}`,
        weight,
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60", // default mock image
        rating: 5.0,
        reviewsCount: 0
      };

      setProducts([newProduct, ...products]);
      
      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setInventory("");
      setSku("");
      setWeight("");
      setShowAddForm(false);
      alert("Product added successfully to Mock list!");
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
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
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Products Manager</h1>
          <p className="text-slate-400 text-xs mt-1">Manage KayaMarket inventory items</p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-green-600/10 focus:outline-none"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        <div className="flex gap-4">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-800">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white max-w-[200px] truncate">{p.name}</h4>
                      <span className="text-[10px] text-slate-500 font-bold">ID: {p.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{p.sku}</td>
                  <td className="px-6 py-4 text-slate-400 capitalize">{p.categorySlug}</td>
                  <td className="px-6 py-4 text-slate-400">{p.weight || "N/A"}</td>
                  <td className="px-6 py-4 font-black text-white">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`font-black ${p.inventory < 10 ? "text-rose-500" : "text-emerald-500"}`}>
                      {p.inventory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
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

      {/* Add Product Modal Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full relative animate-in zoom-in duration-200 text-slate-200">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-black text-white mb-6">Add New Foodstuff</h3>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Product Name</label>
                  <input 
                    type="text" required placeholder="e.g. Kaya Yellow Garri (25kg)"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Price (NGN)</label>
                  <input 
                    type="number" required placeholder="e.g. 24000"
                    value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Stock Inventory</label>
                  <input 
                    type="number" required placeholder="e.g. 50"
                    value={inventory} onChange={(e) => setInventory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Category</label>
                  <select 
                    value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none font-bold"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">SKU</label>
                  <input 
                    type="text" placeholder="e.g. GARI-003"
                    value={sku} onChange={(e) => setSku(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Weight Specification</label>
                  <input 
                    type="text" placeholder="e.g. 20kg"
                    value={weight} onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Description</label>
                  <textarea 
                    rows={3} placeholder="Provide details about the foodstuff..."
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 font-bold text-white rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 font-bold text-white rounded-xl shadow-lg shadow-green-600/10"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
