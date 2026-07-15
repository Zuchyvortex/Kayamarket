export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categorySlug: string;
  image: string;
  inventory: number;
  isFeatured?: boolean;
  sku: string;
  weight?: string;
  rating: number;
  reviewsCount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  total: number;
  items: OrderItem[];
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: string;
  customerName: string;
}

export const CATEGORIES: Category[] = [
  { id: "1", name: "Rice", slug: "rice", description: "Local and imported high-quality rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60" },
  { id: "2", name: "Beans", slug: "beans", description: "Oloyin, white beans, and brown beans", image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500&auto=format&fit=crop&q=60" },
  { id: "3", name: "Garri", slug: "garri", description: "White and yellow Ijebu garri", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop&q=60" },
  { id: "4", name: "Yam", slug: "yam", description: "Fresh tuber yams from Abuja and Benue", image: "https://images.unsplash.com/photo-1590005354167-6da97870c913?w=500&auto=format&fit=crop&q=60" },
  { id: "5", name: "Palm Oil", slug: "palm-oil", description: "Pure, unadulterated red palm oil", image: "https://images.unsplash.com/photo-1622484211148-7163c45dbd4d?w=500&auto=format&fit=crop&q=60" },
  { id: "6", name: "Groundnut Oil", slug: "groundnut-oil", description: "Refined vegetable oil for cooking", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60" },
  { id: "7", name: "Tomatoes", slug: "tomatoes", description: "Fresh, juicy basket tomatoes", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=60" },
  { id: "8", name: "Pepper", slug: "pepper", description: "Rodo, Tatashe, and Shombo", image: "https://images.unsplash.com/photo-1563565038-a44aef2e7424?w=500&auto=format&fit=crop&q=60" },
  { id: "9", name: "Onions", slug: "onions", description: "Red and white onions", image: "https://images.unsplash.com/photo-1618243868665-1f6f10f84126?w=500&auto=format&fit=crop&q=60" },
  { id: "10", name: "Vegetables", slug: "vegetables", description: "Ugu, Shoko, Tete, and Cabbage", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60" },
  { id: "11", name: "Fruits", slug: "fruits", description: "Bananas, oranges, mangoes, pineapples", image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500&auto=format&fit=crop&q=60" },
  { id: "12", name: "Meat", slug: "meat", description: "Fresh beef, goat meat, and ram", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=60" },
  { id: "13", name: "Fish", slug: "fish", description: "Titus, Croaker, Catfish", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500&auto=format&fit=crop&q=60" },
  { id: "14", name: "Seafood", slug: "seafood", description: "Periwinkles, Prawns, Crabs", image: "https://images.unsplash.com/photo-1559737605-de6a255fb34e?w=500&auto=format&fit=crop&q=60" },
  { id: "15", name: "Spices & Seasonings", slug: "spices", description: "Thyme, Curry, Maggi, local spices", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=60" },
  { id: "16", name: "Flour & Grains", slug: "flour-grains", description: "Semovita, Wheat, Cassava flour", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60" },
  { id: "17", name: "Household Essentials", slug: "household", description: "Soaps, detergents, tissue paper", image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=60" },
  { id: "18", name: "Beverages", slug: "beverages", description: "Milo, Milk, Soft drinks, Water", image: "https://images.unsplash.com/photo-1527960659564-77b95dd0d215?w=500&auto=format&fit=crop&q=60" }
];

export const PRODUCTS: Product[] = [
  // Rice
  { id: "p1", name: "Kaya Premium Nigerian Rice", slug: "kaya-premium-rice", description: "Stone-free, parboiled local Nigerian rice, premium grade and perfectly polished.", price: 78000, categorySlug: "rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60", inventory: 45, isFeatured: true, sku: "RICE-001", weight: "50kg", rating: 4.8, reviewsCount: 124 },
  { id: "p2", name: "Kaya Premium Rice (25kg)", slug: "kaya-premium-rice-25kg", description: "Stone-free, parboiled local Nigerian rice, half size.", price: 40000, categorySlug: "rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60", inventory: 60, sku: "RICE-002", weight: "25kg", rating: 4.7, reviewsCount: 82 },
  
  // Beans
  { id: "p3", name: "Oloyin Honey Beans", slug: "oloyin-honey-beans", description: "Sweet, fast-cooking honey beans sourced from Northern Nigeria.", price: 42000, categorySlug: "beans", image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500&auto=format&fit=crop&q=60", inventory: 25, isFeatured: true, sku: "BEAN-001", weight: "20kg", rating: 4.9, reviewsCount: 95 },
  { id: "p4", name: "Brown Beans (Paint Bucket)", slug: "brown-beans-paint", description: "Standard brown beans, clean and sorted.", price: 7500, categorySlug: "beans", image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500&auto=format&fit=crop&q=60", inventory: 5, sku: "BEAN-002", weight: "4kg", rating: 4.2, reviewsCount: 31 },

  // Garri
  { id: "p5", name: "Ijebu Garri (White)", slug: "ijebu-garri-white", description: "Very sour and crispy Ijebu Garri, perfect for drinking or making Eba.", price: 18000, categorySlug: "garri", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop&q=60", inventory: 18, isFeatured: true, sku: "GARI-001", weight: "20kg", rating: 5.0, reviewsCount: 148 },
  { id: "p6", name: "Yellow Garri (20kg)", slug: "yellow-garri-20kg", description: "Crispy yellow garri processed with premium red palm oil.", price: 21000, categorySlug: "garri", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop&q=60", inventory: 15, sku: "GARI-002", weight: "20kg", rating: 4.6, reviewsCount: 56 },

  // Yam
  { id: "p7", name: "Abuja Tuber Yam (Large)", slug: "abuja-tuber-yam-large", description: "Fluffy, dry, sweet Abuja yam. Perfect for boiling or pounding.", price: 6500, categorySlug: "yam", image: "https://images.unsplash.com/photo-1590005354167-6da97870c913?w=500&auto=format&fit=crop&q=60", inventory: 80, isFeatured: true, sku: "YAM-001", weight: "5kg", rating: 4.7, reviewsCount: 112 },

  // Oils
  { id: "p8", name: "Pure Red Palm Oil (5 Litres)", slug: "pure-palm-oil-5l", description: "Freshly pressed red palm oil, free from colorants or additives.", price: 9500, categorySlug: "palm-oil", image: "https://images.unsplash.com/photo-1622484211148-7163c45dbd4d?w=500&auto=format&fit=crop&q=60", inventory: 32, sku: "OIL-001", weight: "5L", rating: 4.8, reviewsCount: 88 },
  { id: "p9", name: "Kaya Refined Vegetable Oil (5L)", slug: "veg-oil-5l", description: "Cholesterol-free refined vegetable cooking oil.", price: 12500, categorySlug: "groundnut-oil", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60", inventory: 40, isFeatured: true, sku: "OIL-002", weight: "5L", rating: 4.7, reviewsCount: 79 },

  // Fresh produce
  { id: "p10", name: "Fresh Basket Tomatoes", slug: "fresh-basket-tomatoes", description: "Bright red, firm tomatoes direct from the farms.", price: 15000, categorySlug: "tomatoes", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=60", inventory: 12, isFeatured: true, sku: "VEG-001", weight: "15kg", rating: 4.5, reviewsCount: 42 },
  { id: "p11", name: "Scotch Bonnet Pepper (Rodo)", slug: "scotch-bonnet-rodo", description: "Spicy and fresh scotch bonnet pepper.", price: 4500, categorySlug: "pepper", image: "https://images.unsplash.com/photo-1563565038-a44aef2e7424?w=500&auto=format&fit=crop&q=60", inventory: 14, sku: "VEG-002", weight: "2kg", rating: 4.6, reviewsCount: 29 },
  { id: "p12", name: "Red Onions (Bag)", slug: "red-onions-bag", description: "Fresh, dry red onions from Alibawa.", price: 18000, categorySlug: "onions", image: "https://images.unsplash.com/photo-1618243868665-1f6f10f84126?w=500&auto=format&fit=crop&q=60", inventory: 8, sku: "VEG-003", weight: "25kg", rating: 4.4, reviewsCount: 36 },

  // Proteins
  { id: "p13", name: "Fresh Goat Meat (Quarter)", slug: "fresh-goat-meat-quarter", description: "Cleaned and cut quarter goat meat, stored under hygiene conditions.", price: 28000, categorySlug: "meat", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=60", inventory: 10, isFeatured: true, sku: "PRO-001", weight: "6kg", rating: 4.9, reviewsCount: 64 },
  { id: "p14", name: "Fresh Titus Fish (Carton)", slug: "fresh-titus-fish-carton", description: "Frozen mackerel fish, highly rich in omega-3.", price: 35000, categorySlug: "fish", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=500&auto=format&fit=crop&q=60", inventory: 4, sku: "PRO-002", weight: "10kg", rating: 4.7, reviewsCount: 43 }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "o1",
    orderNumber: "KM-2026-9812",
    date: "2026-07-14",
    status: "Delivered",
    total: 87500,
    items: [
      { id: "oi1", productId: "p1", productName: "Kaya Premium Nigerian Rice", productImage: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60", price: 78000, quantity: 1 },
      { id: "oi2", productId: "p8", productName: "Pure Red Palm Oil (5 Litres)", productImage: "https://images.unsplash.com/photo-1622484211148-7163c45dbd4d?w=500&auto=format&fit=crop&q=60", price: 9500, quantity: 1 }
    ],
    deliveryAddress: "12, Admiralty Way, Lekki Phase 1, Lagos",
    deliveryDate: "2026-07-15",
    deliveryTime: "10:00 AM - 12:00 PM",
    paymentMethod: "Card Payment",
    customerName: "Chinedu Okafor"
  },
  {
    id: "o2",
    orderNumber: "KM-2026-4421",
    date: "2026-07-15",
    status: "Preparing",
    total: 48500,
    items: [
      { id: "oi3", productId: "p3", productName: "Oloyin Honey Beans", productImage: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500&auto=format&fit=crop&q=60", price: 42000, quantity: 1 },
      { id: "oi4", productId: "p7", productName: "Abuja Tuber Yam (Large)", productImage: "https://images.unsplash.com/photo-1590005354167-6da97870c913?w=500&auto=format&fit=crop&q=60", price: 6500, quantity: 1 }
    ],
    deliveryAddress: "Plot 1043, Garki Area 11, Abuja",
    deliveryDate: "2026-07-16",
    deliveryTime: "02:00 PM - 04:00 PM",
    paymentMethod: "Bank Transfer",
    customerName: "Amara Yusuf"
  }
];

export const MOCK_USERS = [
  { id: "u1", name: "Chinedu Okafor", email: "chinedu@example.com", role: "CUSTOMER", phone: "+234 803 123 4567" },
  { id: "u2", name: "Admin Kaya", email: "admin@kayamarket.com", role: "ADMIN", phone: "+234 812 345 6789" }
];
