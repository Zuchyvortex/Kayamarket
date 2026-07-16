"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PRODUCTS, Product } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Heart, Shield, Award, Truck, Plus, Minus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (params.slug) {
      const found = PRODUCTS.find(p => p.slug === params.slug);
      if (found) {
        setProduct(found);
      }
    }
  }, [params.slug]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4 bg-white text-[#111111]">
        <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
        <p className="text-slate-500 text-sm">The product you are looking for does not exist or has been removed.</p>
        <Link href="/products" className="inline-block bg-kaya-orange hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    setAdding(true);
    setTimeout(() => {
      addToCart(product, quantity);
      setAdding(false);
    }, 500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  // Find related products
  const relatedProducts = PRODUCTS.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white text-[#111111]">
      {/* Back button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center space-x-2 text-slate-550 hover:text-kaya-orange font-bold text-xs uppercase mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to products</span>
      </button>

      {/* Main product box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 sm:p-12 rounded-[3rem] border border-slate-200 shadow-sm mb-16">
        {/* Left: Image */}
        <div className="relative w-full h-[350px] sm:h-[450px] rounded-3xl overflow-hidden bg-slate-50 border border-slate-100">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          {product.inventory < 10 && (
            <span className="absolute bottom-6 left-6 bg-kaya-orange text-white font-extrabold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              Low Stock: Only {product.inventory} left
            </span>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="inline-block bg-orange-50 text-kaya-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-100">
              {product.categorySlug}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4">
              <span className="text-amber-500 font-bold text-sm">★ {product.rating}</span>
              <span className="text-slate-350">|</span>
              <span className="text-slate-500 text-xs">{product.reviewsCount} verified customer reviews</span>
            </div>

            <p className="text-3xl font-black text-slate-950 pt-2">
              {formatPrice(product.price)}
            </p>

            <p className="text-sm text-slate-500 leading-relaxed font-light">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-semibold">
              <div>SKU: <span className="font-extrabold text-slate-800">{product.sku}</span></div>
              <div>Weight: <span className="font-extrabold text-slate-800">{product.weight || "pack"}</span></div>
              <div>Availability: <span className={`font-extrabold ${product.inventory > 0 ? "text-kaya-green" : "text-rose-600"}`}>{product.inventory > 0 ? "In Stock" : "Out of Stock"}</span></div>
              <div>Brand: <span className="font-extrabold text-slate-800">KayaMarket Certified</span></div>
            </div>
          </div>

          {/* Interactive controls */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Quantity selector */}
              <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-3 text-slate-550 hover:text-kaya-orange transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-6 font-bold text-slate-800">{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(product.inventory, prev + 1))}
                  className="p-3 text-slate-550 hover:text-kaya-orange transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button 
                onClick={handleAddToCart}
                disabled={product.inventory <= 0}
                className="w-full sm:flex-1 bg-kaya-orange hover:bg-orange-600 disabled:bg-slate-200 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-sm focus:outline-none"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{adding ? "Adding to basket..." : "Add to Basket"}</span>
              </button>

              {/* Add to Wishlist */}
              <button 
                onClick={() => toggleWishlist(product)}
                className={`p-4 rounded-2xl border transition-all ${isInWishlist(product.id) ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"}`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-rose-600" : ""}`} />
              </button>
            </div>

            {/* Delivery/Security promo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-kaya-orange" />
                <span>24h Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-kaya-orange" />
                <span>Farmer Direct Sourced</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-kaya-orange" />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="group relative bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <Link href={`/products/${p.slug}`} className="block relative w-full h-40 rounded-2xl overflow-hidden bg-slate-50 mb-3 border border-slate-100">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-kaya-orange transition-colors">
                    <Link href={`/products/${p.slug}`}>{p.name}</Link>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{p.weight ? `Weight: ${p.weight}` : "Unit: pack"}</p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                  <span className="text-sm font-black text-slate-950">{formatPrice(p.price)}</span>
                  <button 
                    onClick={() => addToCart(p)}
                    className="bg-kaya-orange hover:bg-orange-600 text-white p-2 rounded-xl shadow-sm transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
