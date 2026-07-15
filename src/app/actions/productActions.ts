"use server";

import { prisma } from "@/lib/prisma";

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Map database models to the format expected by the frontend
    return products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      inventory: p.inventory,
      sku: p.sku,
      categorySlug: p.category.slug,
      image: p.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80',
      rating: 5.0, // Mock rating since it's not in DB schema yet
      reviewsCount: Math.floor(Math.random() * 50) + 1,
      isFeatured: p.isFeatured
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}
