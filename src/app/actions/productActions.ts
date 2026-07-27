"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
      images: p.images && p.images.length > 0 ? p.images : [p.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80'],
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

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true
      }
    });
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      inventory: product.inventory,
      sku: product.sku || '',
      categorySlug: product.category.slug,
      image: product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80',
      images: product.images && product.images.length > 0 ? product.images : [product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80'],
      rating: 5.0,
      reviewsCount: 15,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival
    };
  } catch (error) {
    console.error("Failed to fetch product by slug:", error);
    return null;
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

    const productImages = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []);

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        inventory: data.inventory,
        sku: data.sku,
        categoryId: category.id,
        images: productImages,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        isBestSeller: data.isBestSeller ?? false,
        isNewArrival: data.isNewArrival ?? false
      }
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);

    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const productImages = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : undefined);

    let categoryId = undefined;
    if (data.categorySlug) {
      let category = await prisma.category.findUnique({ where: { slug: data.categorySlug } });
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: data.categorySlug.charAt(0).toUpperCase() + data.categorySlug.slice(1).replace(/-/g, ' '),
            slug: data.categorySlug,
          }
        });
      }
      categoryId = category.id;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        inventory: data.inventory,
        sku: data.sku,
        ...(categoryId ? { categoryId } : {}),
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
        isNewArrival: data.isNewArrival,
        images: productImages,
      }
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);

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

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);

    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    await prisma.product.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/products");
    if (product) {
      revalidatePath(`/products/${product.slug}`);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
