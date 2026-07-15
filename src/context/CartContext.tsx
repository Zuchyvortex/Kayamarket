"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, Order } from '@/lib/mockData';

interface CartItem extends OrderItem {}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  isDefault: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  // Wishlist
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Addresses
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Orders
  orders: Order[];
  placeOrder: (orderDetails: {
    address: string;
    deliveryDate: string;
    deliveryTime: string;
    paymentMethod: string;
    customerName: string;
  }) => Order;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([
    { id: "addr-1", street: "12, Admiralty Way, Lekki Phase 1", city: "Lekki", state: "Lagos", isDefault: true }
  ]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('kayamarket_cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedWishlist = localStorage.getItem('kayamarket_wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const savedAddresses = localStorage.getItem('kayamarket_addresses');
    if (savedAddresses) setAddresses(JSON.parse(savedAddresses));

    const savedOrders = localStorage.getItem('kayamarket_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Save to local storage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('kayamarket_cart', JSON.stringify(newCart));
  };

  const saveWishlist = (newWishlist: Product[]) => {
    setWishlist(newWishlist);
    localStorage.setItem('kayamarket_wishlist', JSON.stringify(newWishlist));
  };

  const saveAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    localStorage.setItem('kayamarket_addresses', JSON.stringify(newAddresses));
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('kayamarket_orders', JSON.stringify(newOrders));
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      saveCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: Math.min(product.inventory, item.quantity + quantity) }
          : item
      ));
    } else {
      saveCart([...cart, {
        id: `ci-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: Math.min(product.inventory, quantity)
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    saveCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart(cart.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Wishlist logic
  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
      saveWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      saveWishlist([...wishlist, product]);
    }
  };

  const isInWishlist = (productId: string) => wishlist.some(item => item.id === productId);

  // Address logic
  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
      isDefault: addr.isDefault || addresses.length === 0
    };
    let updated = [...addresses];
    if (newAddr.isDefault) {
      updated = updated.map(a => ({ ...a, isDefault: false }));
    }
    saveAddresses([...updated, newAddr]);
  };

  const removeAddress = (id: string) => {
    saveAddresses(addresses.filter(a => a.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    saveAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  // Place Order logic
  const placeOrder = (details: {
    address: string;
    deliveryDate: string;
    deliveryTime: string;
    paymentMethod: string;
    customerName: string;
  }) => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: `KM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      total: cartTotal + 2000, // 2000 flat delivery fee
      items: [...cart],
      deliveryAddress: details.address,
      deliveryDate: details.deliveryDate,
      deliveryTime: details.deliveryTime,
      paymentMethod: details.paymentMethod,
      customerName: details.customerName
    };
    saveOrders([newOrder, ...orders]);
    clearCart();
    return newOrder;
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
      wishlist, toggleWishlist, isInWishlist,
      addresses, addAddress, removeAddress, setDefaultAddress,
      orders, placeOrder
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
