"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/lib/mockData";
import { getProducts, getCategories } from "@/app/actions/productActions";
import { Search, SlidersHorizontal, Heart, Plus, ShoppingBag, Star, RefreshCw } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

function ProductsContent() {
  const searchParams = useSearchParams();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string, slug: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const fetchedProducts = await getProducts();
      const fetchedCategories = await getCategories();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setIsLoading(false);
    }
    fetchData();
  }, []);

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
    let result = [...products];

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
  }, [searchTerm, selectedCategory, priceRange, sortBy, products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white text-[#111111]">
      
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-100 pb-8">
        <div>
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Kaya Directory</span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight mt-1">Kaya Marketplace</h1>
          <p className="text-slate-500 text-sm">Browse, filter and find certified foodstuffs and grocery supplies</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <input
            type="text"
            placeholder="Search groceries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange bg-white text-sm font-semibold text-slate-700 shadow-inner"
          />
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400 group-focus-within:text-kaya-orange transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* SIDEBAR FILTERS - Luxury design */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_4px_25px_rgba(0,0,0,0.01)] h-fit space-y-8">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <SlidersHorizontal className="h-4.5 w-4.5 text-kaya-orange" />
            <h2 className="font-extrabold text-slate-800">Filter Market</h2>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categories</h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === "all" 
                    ? "bg-orange-50 text-kaya-orange shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.slug 
                      ? "bg-orange-50 text-kaya-orange shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range slider */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Price</h3>
            <div className="space-y-3">
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-kaya-orange cursor-pointer bg-slate-100 h-1.5 rounded"
              />
              <div className="flex justify-between text-xs font-extrabold text-slate-500">
                <span>{formatPrice(1000)}</span>
                <span>{formatPrice(priceRange)}</span>
              </div>
            </div>
          </div>

          {/* Sort options */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 focus:border-kaya-orange text-xs font-bold text-slate-700 bg-white"
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
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Found {filteredProducts.length} items</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-80 gap-3">
              <RefreshCw className="h-8 w-8 text-kaya-orange animate-spin" />
              <p className="text-slate-500 font-bold animate-pulse text-xs">Fetching live products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-200 shadow-sm space-y-6">
              <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto">
                <ShoppingBag className="h-10 w-10 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-800">No foodstuffs found</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">We couldn't find any products matching your current filters. Try resetting filters.</p>
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setPriceRange(100000);
                  setSortBy("default");
                }}
                className="bg-kaya-orange hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full text-xs transition-colors shadow-md shadow-orange-500/10"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="group relative bg-white rounded-[2.2rem] border border-slate-200 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 duration-350"
                >
                  {/* Heart wishlist button */}
                  <div className="absolute top-6 right-6 z-10">
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`p-2.5 rounded-full shadow-md border border-slate-100 backdrop-blur-md transition-all ${
                        isInWishlist(product.id) 
                          ? "bg-rose-50 text-rose-500 border-rose-100" 
                          : "bg-white/90 text-slate-450 hover:text-rose-500"
                      }`}
                    >
                      <Heart className={`h-4.5 w-4.5 ${isInWishlist(product.id) ? "fill-rose-500" : ""}`} />
                    </button>
                  </div>

                  <div>
                    {/* Image panel */}
                    <Link href={`/products/${product.slug}`} className="block relative w-full h-48 rounded-2xl overflow-hidden bg-slate-50 mb-4 border border-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                      />
                    </Link>

                    {/* Meta info */}
                    <span className="inline-flex items-center gap-1 text-[10px] bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full font-bold border border-slate-100">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-medium">({product.reviewsCount})</span>
                    </span>

                    {/* Details */}
                    <h3 className="font-extrabold text-slate-850 mt-3 text-base line-clamp-1 group-hover:text-kaya-orange transition-colors">
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Weight: {product.weight || "pack"}</p>
                  </div>

                  {/* Pricing and Cart footer */}
                  <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-base font-black text-slate-900">{formatPrice(product.price)}</span>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white p-3 rounded-2xl shadow-md transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 orange-glow"
                    >
                      <Plus className="h-4.5 w-4.5" />
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col justify-center items-center gap-3">
        <RefreshCw className="h-8 w-8 text-kaya-orange animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse text-sm">Loading Kaya Marketplace...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
