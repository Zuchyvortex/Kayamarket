"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, PRODUCTS, Product } from "@/lib/mockData";
import { Search, SlidersHorizontal, Heart, Plus, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

function ProductsContent() {
  const searchParams = useSearchParams();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  // State
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    // Sync search parameter from URL
    const searchVal = searchParams.get("search");
    if (searchVal !== null) {
      setSearchTerm(searchVal);
    }
    const catVal = searchParams.get("category");
    if (catVal !== null) {
      setSelectedCategory(catVal);
    }
  }, [searchParams]);

  useEffect(() => {
    let result = [...PRODUCTS];

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) || 
        p.categorySlug.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(p => p.categorySlug === selectedCategory);
    }

    // Price filter
    result = result.filter(p => p.price <= priceRange);

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kaya Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1">Browse and search all certified foodstuffs and groceries</p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search groceries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit space-y-8">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <SlidersHorizontal className="h-4 w-4 text-green-600" />
            <h2 className="font-bold text-slate-800">Filter Market</h2>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Categories</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === "all" ? "bg-green-50 text-green-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat.slug ? "bg-green-50 text-green-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Price</h3>
            <div className="space-y-2">
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>{formatPrice(1000)}</span>
                <span>{formatPrice(priceRange)}</span>
              </div>
            </div>
          </div>

          {/* Sort options */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="default">Best Match</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
            <span>Found {filteredProducts.length} items</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm space-y-4">
              <ShoppingBag className="h-16 w-16 mx-auto text-slate-300" />
              <h3 className="text-xl font-bold text-slate-700">No foodstuffs found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">We couldn't find any products matching your current filters. Try searching for something else.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setPriceRange(100000);
                  setSortBy("default");
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-full text-xs transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group relative bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
                  {/* Heart button */}
                  <div className="absolute top-6 right-6 z-10">
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`p-2 rounded-full shadow-md border border-slate-50 backdrop-blur-md transition-all ${isInWishlist(product.id) ? "bg-rose-50 text-rose-600" : "bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600"}`}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-rose-600" : ""}`} />
                    </button>
                  </div>

                  <div>
                    {/* Image */}
                    <Link href={`/products/${product.slug}`} className="block relative w-full h-44 rounded-2xl overflow-hidden bg-slate-50 mb-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Meta */}
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">
                      ★ {product.rating} ({product.reviewsCount})
                    </span>

                    {/* Details */}
                    <h3 className="font-bold text-slate-800 mt-2 line-clamp-1 group-hover:text-green-700 transition-colors">
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{product.weight ? `Weight: ${product.weight}` : "Unit: pack"}</p>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
                    <div>
                      <span className="text-base font-black text-slate-800">{formatPrice(product.price)}</span>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 font-bold animate-pulse">Loading Kaya Marketplace...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
