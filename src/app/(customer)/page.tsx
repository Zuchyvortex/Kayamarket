"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Leaf, ShieldCheck, Clock, ShoppingCart, Eye, Heart, Plus, ChevronRight, HelpCircle, Phone, Mail, MapPin } from "lucide-react";
import { CATEGORIES, PRODUCTS, Product } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";

export default function HomePage() {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Filter products for Display
  const featuredProducts = PRODUCTS.filter(p => p.isFeatured);
  const bestSellers = PRODUCTS.slice(0, 4);
  const freshArrivals = PRODUCTS.slice(4, 8);

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
    <div className="bg-slate-50 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-950 text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <span className="inline-flex items-center space-x-2 bg-green-500/20 text-green-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-green-500/30">
              <Leaf className="h-3 w-3" />
              <span>100% Brand Certified Fresh</span>
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Fresh Foodstuff & Groceries <br/>
              <span className="text-amber-400">Direct From the Source.</span>
            </h1>
            <p className="text-base sm:text-lg text-green-100/90 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              We source directly from trusted farmers, wholesalers, and suppliers to bring you high-quality foodstuffs under the **KayaMarket** brand. Fast delivery, fresh guarantee, zero vendor risk.
            </p>

            {/* In-Hero Search */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-2xl sm:rounded-full border border-white/20 backdrop-blur-md">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-green-300" />
                  <input
                    type="text"
                    placeholder="Search tomatoes, yam, rice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full bg-transparent text-white placeholder-green-200/50 focus:outline-none text-sm"
                  />
                </div>
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-green-950 px-6 py-3 rounded-full font-bold transition-all text-sm shrink-0 shadow-lg">
                  Search Market
                </button>
              </div>
            </form>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute top-12 left-12 w-64 h-64 bg-green-500/30 rounded-full filter blur-3xl opacity-30"></div>
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-[2.5rem] bg-gradient-to-tr from-amber-400 to-green-600 p-1 rotate-3 shadow-2xl overflow-hidden hover:rotate-0 transition-all duration-500">
              <div className="w-full h-full bg-green-900 rounded-[2.3rem] flex flex-col justify-center items-center p-8 text-center border-4 border-green-800">
                <Leaf className="h-16 w-16 text-amber-400 mb-4 animate-bounce" />
                <h3 className="text-2xl font-black text-white">Warmth of a Local Market</h3>
                <p className="text-xs text-green-200/80 mt-2 max-w-xs">
                  Packaged and delivered to your doorstep with premium standards.
                </p>
                <div className="mt-6 flex gap-3 text-xs bg-white/10 px-4 py-2 rounded-full border border-white/10">
                  <span className="font-bold text-amber-300">Fast Shipping</span>
                  <span className="text-white/30">|</span>
                  <span className="font-bold text-green-300">Hygiene Checked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Featured Categories</h2>
            <p className="text-sm text-slate-500 mt-1">Browse fresh foodstuffs directly from our store</p>
          </div>
          <Link href="/products" className="text-green-600 hover:text-green-700 font-bold text-sm flex items-center space-x-1 group">
            <span>View All</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {CATEGORIES.slice(0, 6).map((category) => (
            <Link 
              key={category.id} 
              href={`/products?category=${category.slug}`}
              className="bg-white p-5 rounded-3xl text-center shadow-sm hover:shadow-md transition-all border border-slate-100 group flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 relative bg-green-50">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-green-600 transition-colors">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTS DISPLAY SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Shop Fresh Foodstuffs</h2>
            <p className="text-sm text-slate-500 mt-1">Direct from farms, sorted and clean</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveCategory("all")} 
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === "all" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              All Products
            </button>
            {CATEGORIES.slice(0, 4).map(c => (
              <button 
                key={c.id} 
                onClick={() => setActiveCategory(c.slug)} 
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === c.slug ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
              {/* Actions */}
              <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-full shadow-md border border-slate-50 backdrop-blur-md transition-all ${isInWishlist(product.id) ? "bg-rose-50 text-rose-600" : "bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600"}`}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-rose-600" : ""}`} />
                </button>
              </div>

              <div>
                {/* Image */}
                <Link href={`/products/${product.slug}`} className="block relative w-full h-48 rounded-2xl overflow-hidden bg-slate-50 mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.inventory < 10 && (
                    <span className="absolute bottom-3 left-3 bg-amber-500 text-green-950 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Low Stock
                    </span>
                  )}
                </Link>

                {/* Rating */}
                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  ★ {product.rating} ({product.reviewsCount})
                </span>

                {/* Details */}
                <h3 className="font-bold text-slate-800 mt-2 line-clamp-1 group-hover:text-green-700 transition-colors">
                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{product.weight ? `Weight: ${product.weight}` : "Unit: pack"}</p>
              </div>

              <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50">
                <div>
                  <span className="text-lg font-black text-slate-800">{formatPrice(product.price)}</span>
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WEEKLY/MONTHLY FOOD BASKETS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-green-600 font-bold text-xs uppercase tracking-widest bg-green-50 px-4 py-1.5 rounded-full">Kaya Bundles</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mt-3 tracking-tight">Kaya Food Baskets</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            Curated combos of essential local ingredients to save you time and money. One click to fill your pantry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {foodBaskets.map((basket, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
              <div>
                <div className="relative w-full h-56 bg-slate-100 overflow-hidden">
                  <img src={basket.image} alt={basket.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6">
                    <span className="text-amber-300 text-xs font-bold uppercase tracking-widest">Recommended</span>
                    <h3 className="text-white text-xl font-bold mt-1">{basket.name}</h3>
                  </div>
                </div>
                
                <div className="p-8">
                  <p className="text-slate-500 text-sm leading-relaxed italic">
                    "{basket.description}"
                  </p>
                </div>
              </div>

              <div className="p-8 pt-0 flex justify-between items-center border-t border-slate-50">
                <div>
                  <p className="text-xs text-slate-400">Bundle Price</p>
                  <span className="text-2xl font-black text-slate-800">{formatPrice(basket.price)}</span>
                </div>
                
                <button 
                  onClick={() => {
                    // Quick add mock basket logic
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
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all text-xs flex items-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add Basket</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE KAYAMARKET */}
      <section className="py-20 bg-green-950 text-white rounded-[4rem] mx-4 sm:mx-6 lg:mx-8 px-8 sm:px-12 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-green-800/20 rounded-full filter blur-3xl opacity-50"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Our Promise</span>
              <h2 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight">The Kaya Experience</h2>
              <p className="text-green-200/70 mt-4 leading-relaxed font-light">
                We've combined the convenience of modern online shopping with the warm spirit, freshness, and wholesale pricing of a traditional Nigerian market.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: Leaf, title: "Zero Third-Party Vendor Risk", desc: "No random sellers. Everything is purchased, certified, and branded by KayaMarket so you always get exact weights and high quality." },
                { icon: ShieldCheck, title: "Premium Food Handling & Hygiene", desc: "Our foodstuff is thoroughly sorted, stone-free, and packaged under strict sanitary conditions before dispatch." },
                { icon: Clock, title: "Flexible Delivery Scheduling", desc: "Choose your preferred delivery date and time window that fits perfectly into your schedule." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center shrink-0 border border-white/10">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{item.title}</h3>
                    <p className="text-sm text-green-200/60 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md p-8 sm:p-12 rounded-[2.5rem] space-y-6">
            <h3 className="text-2xl font-black text-amber-400">How It Works</h3>
            <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
              {[
                { num: "01", title: "Fill Your Cart", desc: "Browse our parboiled rice, honey beans, fresh vegetables, and cooking oils." },
                { num: "02", title: "Select Delivery Schedule", desc: "Choose your address, delivery day, and convenient time slot." },
                { num: "03", title: "Secure Checkout & Dispatch", desc: "Pay securely via transfer or card, and our dispatch rider delivers to you." }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-green-800 text-white font-bold flex items-center justify-center shrink-0 border-2 border-green-700">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{step.title}</h4>
                    <p className="text-xs text-green-200/60 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <HelpCircle className="h-10 w-10 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Got Questions?</h2>
          <p className="text-slate-500 mt-2 text-sm">We've got the answers you need</p>
        </div>

        <div className="space-y-4">
          {[
            { q: "Is KayaMarket a multi-vendor marketplace?", a: "No. KayaMarket owns all inventory. We buy directly from farmers, wholesalers, and trusted suppliers, sort and verify them, and sell under the KayaMarket brand. You deal only with us." },
            { q: "How fast is delivery?", a: "We deliver within 24 hours. During checkout, you can select your preferred delivery date and choose between morning (10:00 AM - 12:00 PM) or afternoon (02:00 PM - 04:00 PM) delivery slots." },
            { q: "Are the foodstuffs stone-free and clean?", a: "Yes, 100%. Our rice and beans are thoroughly sorted, washed, and cleaned using modern processing systems before packaging, saving you hours of sorting." },
            { q: "Can I return items if I'm not satisfied?", a: "Customer satisfaction is our priority. If an item is damaged or does not meet quality expectations, you can return it to our dispatch rider immediately at the point of delivery for a replacement or refund." }
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <button 
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full px-6 py-5 text-left font-bold text-slate-800 hover:text-green-700 flex justify-between items-center transition-colors focus:outline-none"
              >
                <span>{faq.q}</span>
                <span className="text-green-600 text-lg">{faqOpen === i ? "−" : "+"}</span>
              </button>
              {faqOpen === i && (
                <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Get in Touch</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Have bulk orders or customized requests? Want to partner as a farmer or supplier? Contact our team today.
            </p>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <span>+234 (0) 803 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-600" />
                <span>support@kayamarket.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <span>Lekki Phase 1, Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }} className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Your Name</label>
                <input type="text" required placeholder="Chinedu Okafor" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase">Email Address</label>
                <input type="email" required placeholder="chinedu@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase">Subject</label>
              <input type="text" required placeholder="Bulk Order inquiry" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase">Your Message</label>
              <textarea required rows={4} placeholder="Tell us how we can help you..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"></textarea>
            </div>

            <button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-colors text-sm">
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
