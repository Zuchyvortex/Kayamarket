"use client";

import React, { useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/mockData";
import { Plus, Trash2, X, FolderHeart } from "lucide-react";

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
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Category Manager</h1>
          <p className="text-slate-400 text-xs mt-1">Manage KayaMarket product groupings</p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center gap-2"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
                <FolderHeart className="h-6 w-6" />
              </div>
              <span className="text-[10px] bg-slate-850 text-slate-400 font-bold px-3 py-1 rounded-full border border-slate-800">
                {getProductCount(cat.slug)} Products
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{cat.name}</h3>
              <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed font-light">{cat.description || "No description provided."}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold uppercase">slug: {cat.slug}</span>
              <button 
                onClick={() => {
                  if (confirm(`Delete ${cat.name}? This will not delete products.`)) {
                    setCategories(categories.filter(c => c.id !== cat.id));
                  }
                }}
                className="text-rose-500 hover:text-rose-400 font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full relative animate-in zoom-in duration-200 text-slate-200">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-black text-white mb-6">Add New Category</h3>

            <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">Category Name</label>
                <input 
                  type="text" required placeholder="e.g. Spices & Seasonings"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase tracking-wider">Description</label>
                <textarea 
                  rows={3} placeholder="Describe what products belong to this category..."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                ></textarea>
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
