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
      sku: p.sku || '',
      categorySlug: p.category.slug,
      image: p.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80',
      rating: 5.0, // Mock rating since it's not in DB schema yet
      reviewsCount: Math.floor(Math.random() * 50) + 1,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function createProduct(data: any) {
  try {
    let category = await prisma.category.findUnique({ where: { slug: data.categorySlug } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: data.categorySlug.charAt(0).toUpperCase() + data.categorySlug.slice(1),
          slug: data.categorySlug,
        }
      });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        inventory: data.inventory,
        sku: data.sku,
        categoryId: category.id,
        images: data.images ? [data.images] : [],
      }
    });
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        inventory: data.inventory,
        sku: data.sku,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
        isNewArrival: data.isNewArrival,
        images: data.images ? [data.images] : undefined,
      }
    });
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProductStock(id: string, inventory: number) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { inventory }
    });
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
