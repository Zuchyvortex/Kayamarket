"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFarmers() {
  try {
    const farmers = await prisma.farmer.findMany({
      include: {
        products: true,
        transactions: true
      },
      orderBy: { createdAt: "desc" }
    });
    return farmers;
  } catch (error) {
    console.error("Error fetching farmers:", error);
    return [];
  }
}

export async function createOrUpdateFarmer(data: {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  commissionRate?: number;
  notes?: string;
}) {
  try {
    let farmer;
    if (data.id) {
      farmer = await prisma.farmer.update({
        where: { id: data.id },
        data: {
          name: data.name,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
          commissionRate: data.commissionRate ?? 5.0,
          notes: data.notes || null
        }
      });
    } else {
      farmer = await prisma.farmer.create({
        data: {
          name: data.name,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
          commissionRate: data.commissionRate ?? 5.0,
          notes: data.notes || null
        }
      });
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/analytics");
    return { success: true, farmer };
  } catch (error: any) {
    console.error("Error saving farmer:", error);
    return { success: false, error: error.message || "Failed to save farmer profile." };
  }
}

export async function createFarmerTransaction(data: {
  farmerId: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitCost: number;
  notes?: string;
}) {
  try {
    const farmer = await prisma.farmer.findUnique({ where: { id: data.farmerId } });
    if (!farmer) return { success: false, error: "Farmer/Supplier not found" };

    const totalCost = Number(data.quantity) * Number(data.unitCost);
    const commissionRate = Number(farmer.commissionRate || 5.0);
    const commission = (totalCost * commissionRate) / 100;

    const tx = await prisma.farmerTransaction.create({
      data: {
        farmerId: data.farmerId,
        productId: data.productId || null,
        productName: data.productName,
        quantity: Number(data.quantity),
        unitCost: Number(data.unitCost),
        totalCost,
        commission,
        notes: data.notes || null
      }
    });

    // Update product costPrice and inventory if productId provided
    if (data.productId) {
      await prisma.product.update({
        where: { id: data.productId },
        data: {
          costPrice: Number(data.unitCost),
          farmerId: data.farmerId,
          farmerName: farmer.name,
          inventory: { increment: Number(data.quantity) }
        }
      });
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/analytics");
    return { success: true, transaction: tx };
  } catch (error: any) {
    console.error("Error creating farmer transaction:", error);
    return { success: false, error: error.message || "Failed to record transaction." };
  }
}

export async function getFarmerTransactions(farmerId?: string) {
  try {
    const where = farmerId ? { farmerId } : {};
    const transactions = await prisma.farmerTransaction.findMany({
      where,
      include: {
        farmer: true,
        product: true
      },
      orderBy: { createdAt: "desc" }
    });
    return transactions;
  } catch (error) {
    console.error("Error fetching farmer transactions:", error);
    return [];
  }
}

export async function updateProductCostPrice(productId: string, costPrice: number, farmerId?: string) {
  try {
    let updateData: any = { costPrice: Number(costPrice) };
    if (farmerId) {
      const farmer = await prisma.farmer.findUnique({ where: { id: farmerId } });
      if (farmer) {
        updateData.farmerId = farmerId;
        updateData.farmerName = farmer.name;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData
    });

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/analytics");
    return { success: true, product: updatedProduct };
  } catch (error: any) {
    console.error("Error updating product cost price:", error);
    return { success: false, error: error.message || "Failed to update cost price." };
  }
}
