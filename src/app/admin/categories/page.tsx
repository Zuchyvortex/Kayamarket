"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, FolderHeart, Edit, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "@/app/actions/categoryActions";
import ImageUploader from "@/components/ImageUploader";

export default function AdminCategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Add form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Edit form states
  const [showEditForm, setShowEditForm] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err: any) {
      setErrorMsg("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Show a message and auto-clear it
  const showToast = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      setSuccessMsg(msg);
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(msg);
      setSuccessMsg("");
      setTimeout(() => setErrorMsg(""), 4500);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setActionLoading(true);
    setErrorMsg("");

    try {
      const res = await createCategory({
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl || undefined
      });

      if (res.success) {
        setName("");
        setDescription("");
        setImageUrl("");
        setShowAddForm(false);
        showToast("success", "Category created successfully!");
        loadCategories();
      } else {
        showToast("error", res.error || "Failed to create category.");
      }
    } catch (err: any) {
      showToast("error", "An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editId) return;

    setActionLoading(true);
    setErrorMsg("");

    try {
      const res = await updateCategory(editId, {
        name: editName.trim(),
        description: editDescription.trim(),
        imageUrl: editImageUrl || undefined
      });

      if (res.success) {
        setShowEditForm(false);
        showToast("success", "Category updated successfully!");
        loadCategories();
      } else {
        showToast("error", res.error || "Failed to update category.");
      }
    } catch (err: any) {
      showToast("error", "An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = async (cat: any) => {
    const productsCount = cat._count?.products || 0;
    if (productsCount > 0) {
      showToast("error", `Cannot delete "${cat.name}" because it contains ${productsCount} product(s).`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await deleteCategory(cat.id);
      if (res.success) {
        showToast("success", "Category deleted successfully!");
        loadCategories();
      } else {
        showToast("error", res.error || "Failed to delete category.");
      }
    } catch (err: any) {
      showToast("error", "An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (cat: any) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
    setEditImageUrl(cat.imageUrl || "");
    setShowEditForm(true);
  };

  return (
    <div className="space-y-10 text-slate-800 dark:text-slate-100">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Grouping Console</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Category Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">Manage KayaMarket product groupings and departmental listings</p>
        </div>

        <button 
          onClick={() => {
            setName("");
            setDescription("");
            setImageUrl("");
            setShowAddForm(true);
          }}
          className="bg-kaya-orange hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-orange-500/10 focus:outline-none transition-all duration-300 transform active:scale-95"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 animate-in fade-in slide-in-from-top-4 duration-300">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 animate-in fade-in slide-in-from-top-4 duration-300">
          {errorMsg}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 text-kaya-orange animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Fetching Categories...</p>
        </div>
      ) : (
        <>
          {categories.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8">
              <FolderHeart className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No categories found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create one using the Add button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const prodCount = cat._count?.products || 0;
                return (
                  <div 
                    key={cat.id} 
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="space-y-4">
                      {/* Category Image Display */}
                      <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                        {cat.imageUrl ? (
                          <img 
                            src={cat.imageUrl} 
                            alt={cat.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-slate-400 dark:text-slate-600">
                            <ImageIcon className="h-8 w-8 stroke-[1.5]" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                          </div>
                        )}
                        <span className="absolute top-3 right-3 text-[10px] bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 font-bold px-3 py-1 rounded-full border border-slate-200/55 dark:border-slate-800 shadow-sm backdrop-blur-xs">
                          {prodCount} {prodCount === 1 ? "Product" : "Products"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{cat.name}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed font-light">
                          {cat.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] truncate max-w-[120px]">
                        slug: {cat.slug}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="text-kaya-orange hover:text-orange-655 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 focus:outline-none transition-colors"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(cat)}
                          disabled={actionLoading}
                          className="text-rose-650 hover:text-rose-700 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 focus:outline-none transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-8 sm:p-10 rounded-[3rem] shadow-2xl max-w-md w-full relative animate-in zoom-in duration-200 text-slate-800 dark:text-slate-100">
            <button 
              onClick={() => {
                if (actionLoading) return;
                setShowAddForm(false);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
              Add New Category
            </h3>

            <form onSubmit={handleAddCategory} className="space-y-5 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">Category Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Spices & Seasonings"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  disabled={actionLoading}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">Description</label>
                <textarea 
                  rows={2} 
                  placeholder="Describe what products belong to this category..."
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={actionLoading}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider block">Category Image</label>
                <ImageUploader 
                  onUpload={(url) => setImageUrl(url)} 
                  defaultImage={imageUrl}
                />
              </div>

              <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 font-bold rounded-xl disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="px-6 py-3 bg-kaya-orange hover:bg-orange-600 disabled:bg-slate-200 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 flex items-center gap-1.5 transition-all"
                >
                  {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Create Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-8 sm:p-10 rounded-[3rem] shadow-2xl max-w-md w-full relative animate-in zoom-in duration-200 text-slate-800 dark:text-slate-100">
            <button 
              onClick={() => {
                if (actionLoading) return;
                setShowEditForm(false);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
              Edit Category
            </h3>

            <form onSubmit={handleUpdateCategory} className="space-y-5 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">Category Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Spices & Seasonings"
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={actionLoading}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">Description</label>
                <textarea 
                  rows={2} 
                  placeholder="Describe what products belong to this category..."
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={actionLoading}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider block">Category Image</label>
                <ImageUploader 
                  onUpload={(url) => setEditImageUrl(url)} 
                  defaultImage={editImageUrl}
                />
              </div>

              <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowEditForm(false)}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 font-bold rounded-xl disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="px-6 py-3 bg-kaya-orange hover:bg-orange-600 disabled:bg-slate-200 text-white font-bold rounded-xl shadow-lg shadow-orange-500/10 flex items-center gap-1.5 transition-all"
                >
                  {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
