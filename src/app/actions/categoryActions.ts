"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function createCategory(data: { name: string; description?: string; imageUrl?: string }) {
  try {
    const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    
    // Check if category with this slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug }
    });
    
    if (existing) {
      return { success: false, error: "A category with a similar name already exists." };
    }

    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        imageUrl: data.imageUrl || null,
      }
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/categories");

    return { success: true, category };
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return { success: false, error: error.message || "Failed to create category." };
  }
}

export async function updateCategory(id: string, data: { name: string; description?: string; imageUrl?: string }) {
  try {
    const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    // Check if another category has the same slug
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });

    if (existing) {
      return { success: false, error: "Another category with a similar name already exists." };
    }

    // Get current category slug to handle product categorySlug updates if needed
    const currentCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!currentCategory) {
      return { success: false, error: "Category not found." };
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        imageUrl: data.imageUrl || null,
      }
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/categories");

    return { success: true, category };
  } catch (error: any) {
    console.error("Failed to update category:", error);
    return { success: false, error: error.message || "Failed to update category." };
  }
}

export async function deleteCategory(id: string) {
  try {
    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      return { success: false, error: "Cannot delete category because it has active products. Move or delete those products first." };
    }

    await prisma.category.delete({
      where: { id }
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return { success: false, error: error.message || "Failed to delete category." };
  }
}
