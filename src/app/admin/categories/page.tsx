"use client";

import React, { useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/mockData";
import { Plus, X, FolderHeart } from "lucide-react";

export default function AdminCategoriesManager() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      const newCat = {
        id: `cat-${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/ /g, "-"),
        description,
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60"
      };
      setCategories([...categories, newCat]);
      setName("");
      setDescription("");
      setShowAddForm(false);
      alert("Category added successfully!");
    }
  };

  const getProductCount = (slug: string) => {
    return PRODUCTS.filter(p => p.categorySlug === slug).length;
  };

  return (
    <div className="space-y-10 bg-slate-50 text-[#111111]">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Grouping Console</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Category Manager</h1>
          <p className="text-slate-500 text-xs">Manage KayaMarket product groupings and departmenal listings</p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-orange-500/10 focus:outline-none transition-all duration-300"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-slate-200 p-6 rounded-[2rem] space-y-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-orange-50 text-kaya-orange rounded-2xl flex items-center justify-center border border-orange-100">
                <FolderHeart className="h-6 w-6" />
              </div>
              <span className="text-[10px] bg-slate-50 text-slate-500 font-bold px-3 py-1 rounded-full border border-slate-250">
                {getProductCount(cat.slug)} Products
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">{cat.name}</h3>
              <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed font-light">{cat.description || "No description provided."}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">slug: {cat.slug}</span>
              <button 
                onClick={() => {
                  if (confirm(`Delete ${cat.name}? This will not delete products.`)) {
                    setCategories(categories.filter(c => c.id !== cat.id));
                  }
                }}
                className="text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider text-[10px]"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal - Clean light design */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-[3rem] shadow-2xl max-w-md w-full relative animate-in zoom-in duration-200 text-slate-800">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-950"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-3">Add New Category</h3>

            <form onSubmit={handleAddCategory} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-450 font-bold uppercase tracking-wider">Category Name</label>
                <input 
                  type="text" required placeholder="e.g. Spices & Seasonings"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-850 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-450 font-bold uppercase tracking-wider">Description</label>
                <textarea 
                  rows={3} placeholder="Describe what products belong to this category..."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-850 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-2">
                <button 
                  type="button" onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-kaya-orange hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
