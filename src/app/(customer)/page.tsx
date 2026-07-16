"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Leaf, 
  ShieldCheck, 
  Clock, 
  ShoppingCart, 
  Heart, 
  Plus, 
  ChevronRight, 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  ArrowRight,
  Percent,
  Smartphone,
  Tv,
  Shirt,
  Sparkle,
  Home as HomeIcon
} from "lucide-react";
import { CATEGORIES, PRODUCTS, Product } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";

export default function HomePage() {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  
  // Custom states for visual effects
  const [activeMallTab, setActiveMallTab] = useState("electronics");
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });
  const [scrollY, setScrollY] = useState(0);

  // Parallax scroll position tracker
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter products for Display
  const featuredProducts = PRODUCTS.filter(p => p.isFeatured);
  const bestSellers = PRODUCTS.slice(0, 4);
  const trendingProducts = PRODUCTS.slice(4, 8);
  const recommendedProducts = PRODUCTS.slice(2, 6);

  // Filtered browse section
  const filteredProducts = activeCategory === "all" 
    ? PRODUCTS.slice(0, 8) 
    : PRODUCTS.filter(p => p.categorySlug === activeCategory).slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  };

  // Mall Categories & Mock Data
  const mallCollections = {
    electronics: [
      { id: "m-e1", name: "Premium Blender & Food Processor", price: 45000, rating: 4.8, image: "https://images.unsplash.com/photo-1570222034659-c8249fc436a4?w=500&auto=format&fit=crop&q=60", desc: "High-speed 1500W kitchen motor, perfect for pepper & beans blend" },
      { id: "m-e2", name: "Digital Air Fryer (5.5L)", price: 68000, rating: 4.9, image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500&auto=format&fit=crop&q=60", desc: "Healthy oil-free cooking, digital control timer panel" }
    ],
    fashion: [
      { id: "m-f1", name: "Premium Ankara Summer Kimono", price: 18000, rating: 4.7, image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=60", desc: "100% cotton wax print, elegant relaxed streetwear style" },
      { id: "m-f2", name: "Kaya Branded Unisex Tote Bag", price: 7500, rating: 5.0, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60", desc: "Heavy canvas material, double stitched handles for market grocery load" }
    ],
    beauty: [
      { id: "m-b1", name: "Pure Organic Shea Butter (Raw)", price: 4500, rating: 4.9, image: "https://images.unsplash.com/photo-1608248597481-496100c8c836?w=500&auto=format&fit=crop&q=60", desc: "Handcrafted unrefined shea, direct from local producers" },
      { id: "m-b2", name: "Natural African Black Soap Gel", price: 3200, rating: 4.8, image: "https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?w=500&auto=format&fit=crop&q=60", desc: "Infused with organic honey, tea tree oil, and skin aloe extracts" }
    ],
    household: [
      { id: "m-h1", name: "Premium Kitchen Organizer Rack", price: 16500, rating: 4.6, image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&auto=format&fit=crop&q=60", desc: "Stainless steel rust-free double rack counter organizer" },
      { id: "m-h2", name: "Kaya Luxury Fragrance Reed Diffuser", price: 12000, rating: 4.7, image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=500&auto=format&fit=crop&q=60", desc: "Fresh lavender & lemon peel essential oils, high absorption reeds" }
    ]
  };

  const foodBaskets = [
    {
      id: "b1",
      name: "Kaya Standard Stew Basket",
      description: "Tomatoes (1 basket), Rodo (half paint), Tatashe (half paint), Onions (10 pieces), Garlic & Ginger, Palm Oil (2L).",
      price: 24500,
      image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: "b2",
      name: "Kaya Premium Soup Basket",
      description: "Fresh Ugu vegetables (3 bundles), Egusi (1 custard cup), Stockfish (2 pieces), Smoked Catfish (2 large), Crayfish (1 bag), Palm Oil (1L).",
      price: 18000,
      image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: "b3",
      name: "Kaya Family Food Basket",
      description: "Nigerian Rice (10kg), Oloyin Beans (5kg), Ijebu Garri (5kg), Tubers of Yam (2 large), Groundnut Oil (3L).",
      price: 45000,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60"
    }
  ];

  return (
    <div className="bg-white text-[#111111] min-h-screen font-sans selection:bg-kaya-orange selection:text-white overflow-hidden">
      
      {/* 1. HERO SECTION - PREMIUM FULL-WIDTH BACKGROUND */}
      <section className="relative overflow-hidden text-[#111111] pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-100 min-h-[500px]">
        
        {/* Background Image Container with Slow Zoom and Parallax Scroll */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 bg-cover bg-center hero-bg-zoom transition-transform duration-75 ease-out"
            style={{ 
              backgroundImage: "url('/w-1.png')",
              transform: `translateY(${scrollY * 0.12}px) scale(1.02)`,
            }}
          />
          {/* Subtle Premium White Overlay (75-92% opacity) to keep typography extremely readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/75 lg:bg-gradient-to-r lg:from-white/93 lg:via-white/88 lg:to-white/68"></div>
        </div>

        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-kaya-orange/8 rounded-full filter blur-[120px] animate-pulse-slow z-10 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-kaya-orange/5 rounded-full filter blur-[120px] animate-pulse-slow z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero left text panel */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-orange-50 text-kaya-orange px-4.5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-100 animate-fade-in-up">
              <Leaf className="h-3.5 w-3.5" />
              <span>Africa's Premium Marketplace</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight text-[#111111] animate-fade-in-up">
              Fresh Foodstuff,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-kaya-orange via-orange-500 to-amber-500">
                Delivered Fast & Fresh.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              We source organic foodstuffs directly from trusted African farmers to bring you high-end, clean groceries. Enjoy prompt delivery, hygienic handling, and zero supplier risk.
            </p>

            {/* In-Hero Search - Styled to stand out on light background */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-2 bg-white p-2.5 rounded-3xl sm:rounded-full border border-slate-200 backdrop-blur-xl shadow-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4.5 top-4 h-5 w-5 text-kaya-orange" />
                  <input
                    type="text"
                    placeholder="Search fresh tomatoes, yam, parboiled rice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-13 pr-4 py-3.5 rounded-full bg-transparent text-[#111111] placeholder-slate-400 focus:outline-none text-sm font-semibold"
                  />
                </div>
                <button type="submit" className="bg-gradient-to-r from-kaya-orange to-orange-500 hover:from-orange-500 hover:to-kaya-orange text-white px-8 py-3.5 rounded-full font-bold transition-all duration-300 transform scale-100 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,122,26,0.25)] text-sm shrink-0 shadow-lg relative overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-1.5 justify-center">
                    <span>Search Market</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            </form>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-black text-[#111111]">50k+</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Happy Users</p>
              </div>
              <div>
                <p className="text-2xl font-black text-kaya-orange">100%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Farm Certified</p>
              </div>
              <div>
                <p className="text-2xl font-black text-kaya-orange">&lt; 24h</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Fast Dispatch</p>
              </div>
            </div>
          </div>

          {/* Hero right side graphic - floating product cards */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end mt-12 lg:mt-0">
            {/* Main Centerpiece Card - Redesigned as clean premium light card */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-[3.5rem] bg-gradient-to-tr from-kaya-orange to-[#111111] p-1 rotate-3 shadow-2xl overflow-hidden hover:rotate-0 transition-all duration-500 group">
              <div className="w-full h-full bg-white rounded-[3.3rem] flex flex-col justify-center items-center p-8 text-center border border-slate-100 relative overflow-hidden">
                <img src="/k-1.png" alt="KayaMarket Logo" className="h-16 w-auto mb-6 object-contain group-hover:scale-105 transition-transform duration-500" />
                <h3 className="text-2xl font-black text-[#111111]">Handcrafted Foodstuff</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                  Carefully handpicked, stone-free grain selection, clean packaging, and direct home delivery.
                </p>
                <div className="mt-8 flex gap-3 text-[10px] bg-slate-50 px-5 py-2.5 rounded-full border border-slate-150">
                  <span className="font-bold text-kaya-orange">Hygienic Sort</span>
                  <span className="text-slate-200">|</span>
                  <span className="font-bold text-kaya-orange">Wholesale Rate</span>
                </div>
              </div>
            </div>

            {/* Floating Card 1 */}
            <div className="absolute -top-6 -left-6 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 flex items-center space-x-3 animate-float max-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-orange-50 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=100&auto=format&fit=crop&q=60" className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Roma Tomato</p>
                <p className="text-xs font-black text-slate-800">Fresh Basket</p>
                <p className="text-[10px] font-bold text-kaya-orange mt-0.5">In Stock</p>
              </div>
            </div>

            {/* Floating Card 2 */}
            <div className="absolute -bottom-8 right-6 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 flex items-center space-x-3 animate-float [animation-delay:2s] max-w-[200px]">
              <div className="w-12 h-12 rounded-xl bg-orange-50 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=60" className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Premium Rice</p>
                <p className="text-xs font-black text-slate-800">Stone Free 50kg</p>
                <p className="text-xs font-bold text-kaya-orange mt-0.5">Best Offer</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION - Clean White Canvas */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Store Departments</span>
            <h2 className="text-3xl font-black text-[#111111] tracking-tight mt-1">Featured Categories</h2>
            <p className="text-sm text-slate-500 mt-1">Find organic local ingredients sorted by category</p>
          </div>
          <Link href="/products" className="text-kaya-orange hover:text-orange-655 font-bold text-sm flex items-center space-x-1 group transition-colors">
            <span>Browse All</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {CATEGORIES.slice(0, 6).map((category) => (
            <Link 
              key={category.id} 
              href={`/products?category=${category.slug}`}
              className="bg-white p-6 rounded-3xl text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all border border-slate-200 group flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 relative bg-slate-50 flex items-center justify-center border border-slate-100">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-sm font-bold text-slate-805 group-hover:text-kaya-orange transition-colors">{category.name}</h3>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FLASH SALES SECTION - Styled with clean light backgrounds */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-kaya-orange to-amber-500 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-orange-500/10">
          
          {/* Ambient Glows */}
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-white/10 rounded-full filter blur-2xl"></div>
          <div className="absolute top-4 left-1/3 w-48 h-48 bg-amber-400/20 rounded-full filter blur-xl animate-pulse-slow"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Flash Info Panel */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                <Percent className="h-3.5 w-3.5 text-white animate-bounce" />
                <span>Limited Flash Offers</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none">
                Weekly Flash Sale <br />Is Running Live!
              </h2>
              
              <p className="text-sm text-white/80 max-w-sm mx-auto lg:mx-0">
                Massive discounts on premium foodstuff packages. Grab fresh supplies at wholesale prices before the timer runs out!
              </p>

              {/* Countdown Ticker */}
              <div className="flex justify-center lg:justify-start gap-3 text-center">
                <div className="bg-[#111111]/90 text-white p-3 rounded-2xl w-16 border border-white/10">
                  <span className="block text-lg font-black">{timeLeft.hours.toString().padStart(2, '0')}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Hrs</span>
                </div>
                <div className="bg-[#111111]/90 text-white p-3 rounded-2xl w-16 border border-white/10">
                  <span className="block text-lg font-black">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Min</span>
                </div>
                <div className="bg-[#111111]/90 text-white p-3 rounded-2xl w-16 border border-white/10">
                  <span className="block text-lg font-black text-kaya-orange">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Sec</span>
                </div>
              </div>
            </div>

            {/* Flash Sale Product cards list */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featuredProducts.slice(0, 2).map((product) => (
                <div 
                  key={product.id}
                  className="bg-white p-5 rounded-3xl text-[#111111] shadow-lg border border-slate-100 relative group/flash overflow-hidden hover:-translate-y-1.5 transition-all duration-300"
                >
                  <span className="absolute top-4 left-4 bg-rose-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full z-10 shadow-sm">
                    Save 15%
                  </span>
                  
                  {/* Image wrapper */}
                  <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-50">
                    <img src={product.image} className="w-full h-full object-cover group-hover/flash:scale-105 transition-transform duration-500" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                  </div>

                  {/* Rating / Title */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-kaya-orange uppercase tracking-widest">{product.categorySlug}</span>
                      <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {product.rating}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-base truncate text-slate-900 hover:text-kaya-orange transition-colors">
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h4>
                    
                    <p className="text-[10px] text-slate-400">Weight: {product.weight || "Pack"}</p>
                  </div>

                  {/* Price and Add button */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-400 line-through">{formatPrice(product.price * 1.15)}</p>
                      <p className="text-lg font-black text-slate-900">{formatPrice(product.price)}</p>
                    </div>
                    
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-kaya-orange hover:bg-orange-600 text-white p-2.5 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                    >
                      <Plus className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 4. MAIN FRESH GROCERIES DIRECTORY - Separated by Light Gray Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#F8FAFC] rounded-[3.5rem] shadow-[0_4px_30px_rgba(0,0,0,0.01)] border border-slate-205">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-200 pb-8">
          <div>
            <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Fresh Farm Market</span>
            <h2 className="text-3xl font-black text-[#111111] tracking-tight mt-1">Shop Fresh Foodstuffs</h2>
            <p className="text-sm text-slate-500">100% stone-free, hygienic, packaged and clean local food products</p>
          </div>

          {/* Categories Tab selector */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveCategory("all")} 
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === "all" 
                  ? "bg-kaya-orange text-white shadow-md shadow-orange-500/10" 
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Products
            </button>
            {CATEGORIES.slice(0, 5).map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveCategory(c.slug)} 
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeCategory === c.slug 
                    ? "bg-kaya-orange text-white shadow-md shadow-orange-500/10" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group relative bg-white rounded-[2.2rem] border border-slate-200 p-4 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col justify-between overflow-hidden hover:-translate-y-2"
            >
              {/* Wishlist toggle action */}
              <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-full shadow-lg border border-slate-150 backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                    isInWishlist(product.id) 
                      ? "bg-rose-50 text-rose-500 shadow-rose-100 border-rose-100" 
                      : "bg-white/90 text-slate-400 hover:text-rose-500"
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 transition-transform ${isInWishlist(product.id) ? "fill-rose-500 scale-115" : ""}`} />
                </button>
              </div>

              <div>
                {/* Image panel */}
                <Link href={`/products/${product.slug}`} className="block relative w-full h-56 rounded-2xl overflow-hidden bg-slate-50 mb-5 border border-slate-155">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {product.inventory < 10 && (
                    <span className="absolute bottom-3 left-3 bg-kaya-orange text-white font-black text-[9px] px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                      Low Stock
                    </span>
                  )}
                </Link>

                {/* Rating & reviews */}
                <span className="inline-flex items-center space-x-1 text-[10px] bg-slate-50 text-slate-650 px-3 py-1.5 rounded-full font-bold border border-slate-200">
                  <span className="text-yellow-500 font-black">★</span> 
                  <span className="font-extrabold text-slate-800">{product.rating}</span>
                  <span className="text-slate-400 font-medium">({product.reviewsCount})</span>
                </span>

                {/* Details */}
                <h3 className="font-extrabold text-[#111111] mt-4 text-lg line-clamp-1 group-hover:text-kaya-orange transition-colors">
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h3>
                <p className="text-xs text-slate-450 mt-1">Weight: {product.weight || "pack"}</p>
              </div>

              {/* Price footer bar */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Our Price</p>
                  <span className="text-xl font-black text-slate-900">{formatPrice(product.price)}</span>
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-slate-900 hover:bg-kaya-orange text-white p-3.5 rounded-2xl shadow-md hover:shadow-orange-500/20 transition-all duration-300 transform hover:scale-108 hover:-translate-y-0.5 relative overflow-hidden group/btn focus:outline-none"
                >
                  <ShoppingCart className="h-4.5 w-4.5 relative z-10" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* 5. EXTENDED MARKET COLLECTIONS: tech, fashion, beauty, home */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest px-4 py-1.5 bg-orange-50 rounded-full border border-orange-100">Kaya Mall Collections</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-3">Extended Marketplace Catalog</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Beyond foodstuff, discover our curated collections of premium home essentials, kitchenwares, cosmetics, and African fashion styles.
          </p>
        </div>

        {/* Mall Tabs Selector */}
        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {[
            { id: "electronics", label: "Tech & Kitchen", icon: Tv },
            { id: "fashion", label: "Ankara & Wear", icon: Shirt },
            { id: "beauty", label: "Shea & Cosmetics", icon: Sparkle },
            { id: "household", label: "Home Essentials", icon: HomeIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveMallTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeMallTab === tab.id
                  ? "bg-slate-900 text-white shadow-lg"
                  : "bg-white text-slate-650 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <tab.icon className={`h-4.5 w-4.5 ${activeMallTab === tab.id ? "text-kaya-orange" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Selected Mall tab products list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mallCollections[activeMallTab as keyof typeof mallCollections].map((item, index) => (
            <div 
              key={item.id} 
              className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all flex flex-col sm:flex-row gap-6 group"
            >
              <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
              </div>
              
              <div className="flex flex-col justify-between flex-1 py-1">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-kaya-orange uppercase tracking-widest">Premium Mall</span>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {item.rating}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#111111] text-lg line-clamp-1 group-hover:text-kaya-orange transition-colors">{item.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">{item.desc}</p>
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-3 border-t border-slate-100">
                  <span className="text-xl font-black text-slate-900">{formatPrice(item.price)}</span>
                  <button 
                    onClick={() => {
                      const mappedProduct: Product = {
                        id: item.id,
                        name: item.name,
                        slug: item.id,
                        description: item.desc,
                        price: item.price,
                        categorySlug: activeMallTab,
                        image: item.image,
                        inventory: 10,
                        sku: `MALL-${item.id}`,
                        rating: item.rating,
                        reviewsCount: 15
                      };
                      addToCart(mappedProduct);
                      alert(`${item.name} added to cart!`);
                    }}
                    className="bg-kaya-orange hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md hover:shadow-orange-500/10 focus:outline-none"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 6. WEEKLY/MONTHLY FOOD BASKETS (Bundles) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">Kaya Combo Bundles</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] mt-3 tracking-tight">Kaya Food Baskets</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Curated combos of essential local cooking ingredients to save you time and money. Fill your pantry in a single click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {foodBaskets.map((basket, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-[0_25px_50px_rgba(0,0,0,0.06)] transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="relative w-full h-56 bg-slate-100 overflow-hidden">
                  <img src={basket.image} alt={basket.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">Recommended Combo</span>
                    <h3 className="text-white text-xl font-extrabold mt-2">{basket.name}</h3>
                  </div>
                </div>
                
                <div className="p-8">
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                    "{basket.description}"
                  </p>
                </div>
              </div>

              <div className="p-8 pt-0 flex justify-between items-center border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Bundle Price</p>
                  <span className="text-2xl font-black text-slate-900">{formatPrice(basket.price)}</span>
                </div>
                
                <button 
                  onClick={() => {
                    const basketProduct: Product = {
                      id: basket.id,
                      name: basket.name,
                      slug: basket.id,
                      description: basket.description,
                      price: basket.price,
                      categorySlug: "rice",
                      image: basket.image,
                      inventory: 10,
                      sku: `BSK-${basket.id}`,
                      rating: 5,
                      reviewsCount: 12
                    };
                    addToCart(basketProduct);
                  }}
                  className="bg-kaya-orange hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md hover:shadow-orange-500/20 transition-all text-xs flex items-center space-x-2 focus:outline-none"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add Basket</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WHY CHOOSE KAYAMARKET - Redesigned as clean premium light gray container with high-contrast text */}
      <section className="py-20 bg-[#F8FAFC] text-[#111111] rounded-[4rem] mx-4 sm:mx-6 lg:mx-8 px-8 sm:px-12 relative overflow-hidden border border-slate-200 shadow-sm">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-kaya-orange/5 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute left-0 top-0 w-96 h-96 bg-kaya-orange/5 rounded-full filter blur-3xl opacity-50"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          <div className="space-y-8">
            <div>
              <span className="text-kaya-orange font-bold text-xs uppercase tracking-widest">Our Direct Promise</span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight text-[#111111]">The Kaya Guarantee</h2>
              <p className="text-slate-600 mt-4 leading-relaxed font-light">
                We've combined the efficiency and pricing structure of a traditional open market with a premium, reliable delivery infrastructure.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: Leaf, title: "Zero Third-Party Vendor Risk", desc: "We own all store stock. Every item is verified, sorted, and clean-packed under KayaMarket supervision so you get exact weights and high quality." },
                { icon: ShieldCheck, title: "Strict Quality Handling", desc: "Our local grains are thoroughly sorted, destoned, washed, and securely sealed before they leave our warehouse." },
                { icon: Clock, title: "Flexible Delivery Scheduling", desc: "Select your preferred delivery date and morning/afternoon time slots at checkout to fit your schedule." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-kaya-orange flex items-center justify-center shrink-0 group-hover:bg-kaya-orange group-hover:text-white transition-colors duration-300 shadow-sm">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Panel */}
          <div className="bg-white border border-slate-200 p-8 sm:p-12 rounded-[3rem] space-y-6 shadow-sm">
            <span className="text-xs font-bold text-kaya-orange uppercase tracking-widest">Happy Customers</span>
            <h3 className="text-2xl font-black text-[#111111]">What Users Say</h3>
            
            <div className="space-y-8">
              {[
                { name: "Mrs. Ngozi Adeleke", role: "Catering Business Owner", text: "The premium Nigerian rice from Kaya is genuinely stone-free. Saves my kitchen staff hours of sorting time. Incredible service!" },
                { name: "Dr. Tunde Alao", role: "Lekki Resident", text: "Very prompt delivery slots. I scheduled afternoon delivery and got my fresh tomatoes basket right on time. Highly recommended." }
              ].map((t, idx) => (
                <div key={idx} className="border-l-2 border-kaya-orange pl-5 space-y-2">
                  <p className="text-slate-600 italic text-sm leading-relaxed">
                    "{t.text}"
                  </p>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 8. MOBILE APP DOWNLOAD SECTION - Redesigned to stand out on light background */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-[3.5rem] p-10 md:p-16 border border-slate-200 text-[#111111] relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-kaya-orange/5 rounded-full filter blur-[100px] animate-pulse"></div>
          <div className="absolute left-1/4 bottom-0 w-72 h-72 bg-orange-50/5 rounded-full filter blur-[80px]"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Download Text panel */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-slate-50 px-4 py-1.5 rounded-full text-xs font-bold text-kaya-orange border border-slate-200 uppercase tracking-widest">
                <Smartphone className="h-4 w-4" />
                <span>KayaMobile App</span>
              </div>
              
              <h2 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-[#111111]">
                Order Fresh Foodstuffs <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-kaya-orange to-amber-500">Direct From Your Mobile.</span>
              </h2>
              
              <p className="text-slate-600 text-sm max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                Download the official KayaMarket mobile application today. Experience faster loading speeds, quick checkout, real-time dispatch tracking, and notifications on fresh harvest arrivals.
              </p>

              {/* Download buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <a 
                  href="https://apple.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all shadow-lg hover:-translate-y-0.5"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg" className="h-5 w-5 invert" alt="" />
                  <div className="text-left">
                    <p className="text-[8px] uppercase text-slate-400 font-bold leading-none">Download on the</p>
                    <p className="text-sm font-black leading-tight">App Store</p>
                  </div>
                </a>
                <a 
                  href="https://google.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white hover:bg-slate-50 text-slate-900 px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all border border-slate-200 shadow-lg hover:-translate-y-0.5"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Play_Store_badge_EN.svg" className="h-5 w-5" alt="" />
                  <div className="text-left">
                    <p className="text-[8px] uppercase text-slate-550 font-bold leading-none">Get it on</p>
                    <p className="text-sm font-black leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Graphic Mockup Panel */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-64 h-[450px] bg-slate-900 rounded-[2.8rem] border-[6px] border-slate-800 shadow-2xl p-3 flex flex-col justify-between overflow-hidden">
                <div className="h-4 w-24 bg-slate-800 rounded-full mx-auto mb-2"></div>
                
                {/* App Screen mock */}
                <div className="flex-1 bg-slate-950 rounded-[2rem] p-4 flex flex-col justify-between border border-slate-800 overflow-hidden relative">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <img src="/k-1.png" className="h-6 w-auto object-contain" alt="" />
                      <span className="text-[8px] font-black text-kaya-orange bg-orange-500/10 px-2 py-0.5 rounded">Active</span>
                    </div>
                    
                    <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Today's Hot Offer</p>
                      <p className="text-[10px] font-black text-white mt-0.5">Roma Tomatoes (15kg)</p>
                      <p className="text-xs font-black text-kaya-orange mt-1">₦15,000</p>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Popular Categories</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <span className="bg-slate-900 p-2 rounded-xl text-[8px] font-bold text-center border border-slate-800">Rice & Grains</span>
                        <span className="bg-slate-900 p-2 rounded-xl text-[8px] font-bold text-center border border-slate-800">Beans & Tubers</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-kaya-orange text-white py-2 rounded-xl text-[9px] font-black shadow-md shadow-orange-500/10">
                    Fast Checkout Now
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <HelpCircle className="h-10 w-10 text-kaya-orange mx-auto mb-4" />
          <h2 className="text-3xl font-black text-[#111111] tracking-tight">Got Questions?</h2>
          <p className="text-slate-500 mt-2 text-sm">Everything you need to know about purchasing foodstuffs on KayaMarket</p>
        </div>

        <div className="space-y-4">
          {[
            { q: "Is KayaMarket a multi-vendor marketplace?", a: "No. KayaMarket owns and coordinates all stock in our distribution warehouse. We purchase directly from farmers and verified suppliers, inspect, clean and package it ourselves. You buy directly from us, meaning zero vendor-mixup risk." },
            { q: "How fast is delivery?", a: "We deliver within 24 hours. During checkout, you can select your preferred delivery date and choose between morning (10:00 AM - 12:00 PM) or afternoon (02:00 PM - 04:00 PM) delivery slots." },
            { q: "Are the foodstuffs stone-free and clean?", a: "Yes, 100%. Our rice, beans, and grains are thoroughly sorted, washed, and cleaned using modern processing systems before packaging, saving you hours of sorting." },
            { q: "Can I return items if I'm not satisfied?", a: "Customer satisfaction is our priority. If an item is damaged or does not meet quality expectations, you can return it to our dispatch rider immediately at the point of delivery for a replacement or refund." }
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full px-6 py-5 text-left font-bold text-slate-800 hover:text-kaya-orange flex justify-between items-center transition-colors focus:outline-none"
              >
                <span>{faq.q}</span>
                <span className="text-kaya-orange text-lg font-black">{faqOpen === i ? "−" : "+"}</span>
              </button>
              {faqOpen === i && (
                <div className="px-6 pb-6 text-sm text-slate-650 leading-relaxed border-t border-slate-100 pt-4 font-semibold bg-slate-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. CONTACT SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-[#111111] tracking-tight">Get in Touch</h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              Have bulk orders or customized requests? Want to partner as a farmer or supplier? Contact our team today.
            </p>
            <div className="space-y-4 text-sm text-slate-600 font-bold">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-kaya-orange" />
                <span>+234 (0) 803 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-kaya-orange" />
                <span>support@kayamarket.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-kaya-orange" />
                <span>Lekki Phase 1, Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }} className="lg:col-span-2 bg-[#F8FAFC] p-8 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Your Name</label>
                <input type="text" required placeholder="Chinedu Okafor" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 text-sm font-semibold text-slate-800" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Email Address</label>
                <input type="email" required placeholder="chinedu@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 text-sm font-semibold text-slate-800" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Subject</label>
              <input type="text" required placeholder="Bulk Order inquiry" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 text-sm font-semibold text-slate-800" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Your Message</label>
              <textarea required rows={4} placeholder="Tell us how we can help you..." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-kaya-orange/20 text-sm font-semibold text-slate-800"></textarea>
            </div>

            <button type="submit" className="w-full sm:w-auto bg-kaya-orange hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-colors text-sm focus:outline-none">
              Send Message
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
