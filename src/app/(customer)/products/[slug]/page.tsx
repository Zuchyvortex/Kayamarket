"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PRODUCTS, Product } from "@/lib/mockData";
import { getProductBySlug, getProducts } from "@/app/actions/productActions";
import { getProductReviews } from "@/app/actions/reviewActions";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Heart, Shield, Award, Truck, Plus, Minus, ArrowLeft, Star, CheckCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  
  const [product, setProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviewsData, setReviewsData] = useState<{ reviews: any[]; averageRating: number; totalCount: number }>({
    reviews: [],
    averageRating: 5.0,
    totalCount: 0
  });

  useEffect(() => {
    if (params.slug) {
      getProductBySlug(params.slug as string).then(found => {
        if (found) {
          setProduct(found);
          setActiveImage(found.image);
          fetchReviews(found.id);
        } else {
          const mockFound = PRODUCTS.find(p => p.slug === params.slug);
          if (mockFound) {
            setProduct(mockFound);
            setActiveImage(mockFound.image);
            fetchReviews(mockFound.id);
          }
        }
      });
    }
  }, [params.slug]);

  const fetchReviews = async (productId: string) => {
    const res = await getProductReviews(productId);
    if (res.success) {
      setReviewsData({
        reviews: res.reviews,
        averageRating: res.averageRating,
        totalCount: res.totalCount
      });
    }
  };

  useEffect(() => {
    if (product) {
      getProducts().then(allProducts => {
        const filtered = allProducts.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);
        setRelatedProducts(filtered);
      });
    }
  }, [product]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-900 dark:text-slate-100 font-sans">
      {/* Back button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center space-x-2 text-slate-500 hover:text-kaya-orange font-bold text-xs uppercase mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to products</span>
      </button>

      {/* Main product box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm mb-16">
        {/* Left: Image & Thumbnails */}
        <div className="space-y-4">
          <div className="relative w-full h-[350px] sm:h-[450px] rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800">
            <img 
              src={activeImage || product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-all duration-300"
            />
            {product.inventory < 10 && (
              <span className="absolute bottom-6 left-6 bg-kaya-orange text-white font-extrabold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                Low Stock: Only {product.inventory} left
              </span>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-200">
              {product.images.map((imgUrl: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    (activeImage || product.image) === imgUrl ? "border-kaya-orange scale-105 shadow-md shadow-orange-500/10" : "border-slate-100 dark:border-slate-800 opacity-75 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="inline-block bg-orange-50 dark:bg-orange-950/40 text-kaya-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-100 dark:border-orange-900/40">
              {product.categorySlug}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4">
              <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{reviewsData.averageRating.toFixed(1)}</span>
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
                {reviewsData.totalCount} verified customer reviews
              </span>
            </div>

            <p className="text-3xl font-black text-slate-900 dark:text-white pt-2">
              {formatPrice(product.price)}
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-semibold">
              <div>SKU: <span className="font-extrabold text-slate-900 dark:text-white">{product.sku}</span></div>
              <div>Weight: <span className="font-extrabold text-slate-900 dark:text-white">{product.weight || "pack"}</span></div>
              <div>Availability: <span className={`font-extrabold ${product.inventory > 0 ? "text-emerald-600" : "text-rose-600"}`}>{product.inventory > 0 ? "In Stock" : "Out of Stock"}</span></div>
              <div>Brand: <span className="font-extrabold text-slate-900 dark:text-white">KayaMarket Verified</span></div>
            </div>
          </div>

          {/* Interactive controls */}
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Quantity selector */}
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-955 p-1">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-3 text-slate-500 hover:text-kaya-orange transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-6 font-bold text-slate-900 dark:text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(product.inventory, prev + 1))}
                  className="p-3 text-slate-500 hover:text-kaya-orange transition-colors"
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
                className={`p-4 rounded-2xl border transition-all ${isInWishlist(product.id) ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600"}`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-rose-600" : ""}`} />
              </button>
            </div>

            {/* Security promo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-kaya-orange" />
                <span>24h Express Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-kaya-orange" />
                <span>Farm Direct Sourced</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-kaya-orange" />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFIED CUSTOMER REVIEWS SECTION (Requirement 4 & 5) */}
      <section className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm mb-16 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <span className="text-[10px] font-black uppercase text-kaya-orange tracking-widest">AUTHENTICATED REVIEWS</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Customer Reviews & Ratings</h2>
            <p className="text-xs text-slate-400">Restricted to verified buyers after completed order delivery.</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-955 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white block">{reviewsData.averageRating.toFixed(1)}</span>
              <div className="flex justify-center text-amber-400 text-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-3.5 w-3.5 ${star <= Math.round(reviewsData.averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"}`} />
                ))}
              </div>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">{reviewsData.totalCount} Reviews</span>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                100% Verified
              </span>
            </div>
          </div>
        </div>

        {reviewsData.reviews.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <MessageSquare className="h-8 w-8 mx-auto opacity-50" />
            <p className="text-xs font-bold">No product reviews yet.</p>
            <p className="text-[11px]">Be the first verified customer to rate this product after delivery!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewsData.reviews.map((rev) => (
              <div key={rev.id} className="bg-slate-50 dark:bg-slate-955 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{rev.displayName || rev.user?.firstName || "Verified Customer"}</span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified Purchase
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-3.5 w-3.5 ${star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"}`} />
                    ))}
                  </div>
                </div>

                {rev.title && <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{rev.title}</h4>}
                <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">{rev.comment}</p>
                <span className="text-[9px] text-slate-400 font-mono block pt-1">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <Link href={`/products/${p.slug}`} className="block relative w-full h-40 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-955 mb-3 border border-slate-100 dark:border-slate-800">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-kaya-orange transition-colors">
                    <Link href={`/products/${p.slug}`}>{p.name}</Link>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{p.weight ? `Weight: ${p.weight}` : "Unit: pack"}</p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{formatPrice(p.price)}</span>
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
