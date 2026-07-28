"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_BUNDLES = [
  {
    name: "Kaya Starter Basket",
    slug: "starter-basket",
    description: "Nigerian Parboiled Rice (5kg), Pure Palm Oil (2L), Groundnut Oil (2L), Tubers of Yam (1 large).",
    price: 25000,
    originalPrice: 28000,
    discountPercentage: 11,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60",
    includedProducts: ["Nigerian Rice (5kg)", "Palm Oil (2L)", "Groundnut Oil (2L)", "Yam Tuber"],
    displayOrder: 1,
    isVisible: true
  },
  {
    name: "Kaya Soup & Spice Basket",
    slug: "soup-spice-basket",
    description: "Basket of Fresh Roma Tomatoes, Fresh Shombo & Tatashe Peppers, Red Onions (5kg), Crayfish (1 paint).",
    price: 18500,
    originalPrice: 22000,
    discountPercentage: 16,
    image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=60",
    includedProducts: ["Roma Tomatoes", "Shombo Pepper", "Tatashe Pepper", "Red Onions", "Crayfish"],
    displayOrder: 2,
    isVisible: true
  },
  {
    name: "Kaya Family Mega Food Basket",
    slug: "family-mega-basket",
    description: "Nigerian Rice (10kg), Oloyin Beans (5kg), Ijebu Garri (5kg), Tubers of Yam (2 large), Groundnut Oil (3L).",
    price: 45000,
    originalPrice: 52000,
    discountPercentage: 13,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60",
    includedProducts: ["Nigerian Rice (10kg)", "Oloyin Beans (5kg)", "Ijebu Garri (5kg)", "Yam Tubers (2)", "Groundnut Oil (3L)"],
    displayOrder: 3,
    isVisible: true
  }
];

export async function getComboBundles() {
  try {
    let bundles = await prisma.comboBundle.findMany({
      orderBy: { displayOrder: "asc" }
    });

    if (bundles.length === 0) {
      // Seed default bundles
      await prisma.comboBundle.createMany({
        data: DEFAULT_BUNDLES
      });
      bundles = await prisma.comboBundle.findMany({
        orderBy: { displayOrder: "asc" }
      });
    }

    return bundles.map(b => ({
      ...b,
      price: Number(b.price),
      originalPrice: b.originalPrice ? Number(b.originalPrice) : null
    }));
  } catch (error) {
    console.error("Error fetching combo bundles:", error);
    return [];
  }
}

export async function getPublicComboBundles() {
  try {
    const bundles = await getComboBundles();
    return bundles.filter(b => b.isVisible);
  } catch (error) {
    console.error("Error fetching public combo bundles:", error);
    return [];
  }
}

export async function createComboBundle(data: {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  includedProducts?: string[];
  displayOrder?: number;
  isVisible?: boolean;
}) {
  try {
    const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const bundle = await prisma.comboBundle.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice || null,
        discountPercentage: data.discountPercentage || 0,
        image: data.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60",
        includedProducts: data.includedProducts || [],
        displayOrder: data.displayOrder || 0,
        isVisible: data.isVisible ?? true
      }
    });

    revalidatePath("/");
    revalidatePath("/admin/bundles");
    return { success: true, bundle };
  } catch (error: any) {
    console.error("Error creating bundle:", error);
    return { success: false, error: error.message || "Failed to create combo bundle." };
  }
}

export async function updateComboBundle(id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
  image?: string;
  includedProducts?: string[];
  displayOrder?: number;
  isVisible?: boolean;
}) {
  try {
    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }

    const updated = await prisma.comboBundle.update({
      where: { id },
      data: updateData
    });

    revalidatePath("/");
    revalidatePath("/admin/bundles");
    return { success: true, bundle: updated };
  } catch (error: any) {
    console.error("Error updating bundle:", error);
    return { success: false, error: error.message || "Failed to update combo bundle." };
  }
}

export async function deleteComboBundle(id: string) {
  try {
    await prisma.comboBundle.delete({
      where: { id }
    });

    revalidatePath("/");
    revalidatePath("/admin/bundles");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting bundle:", error);
    return { success: false, error: error.message || "Failed to delete combo bundle." };
  }
}

export async function toggleBundleVisibility(id: string, isVisible: boolean) {
  try {
    const updated = await prisma.comboBundle.update({
      where: { id },
      data: { isVisible }
    });

    revalidatePath("/");
    revalidatePath("/admin/bundles");
    return { success: true, bundle: updated };
  } catch (error: any) {
    console.error("Error toggling bundle visibility:", error);
    return { success: false, error: error.message || "Failed to update visibility." };
  }
}
