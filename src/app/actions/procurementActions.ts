"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProcurementRecords() {
  try {
    const procurements = await prisma.procurement.findMany({
      include: {
        farmer: true,
        product: true
      },
      orderBy: { date: "desc" }
    });
    return procurements;
  } catch (error) {
    console.error("Error fetching procurements:", error);
    return [];
  }
}

export async function createProcurementRecord(data: {
  farmerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  supplierNotes?: string;
  createdBy?: string;
}) {
  try {
    const qty = Number(data.quantity);
    const price = Number(data.unitPrice);

    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: "Quantity must be a positive number." };
    }
    if (isNaN(price) || price < 0) {
      return { success: false, error: "Unit price must be valid." };
    }

    const farmer = await prisma.farmer.findUnique({ where: { id: data.farmerId } });
    if (!farmer) {
      return { success: false, error: "Selected Farmer profile not found." };
    }

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) {
      return { success: false, error: "Selected Product not found." };
    }

    const totalAmount = qty * price;

    // 1. Create Procurement Record
    const procurement = await prisma.procurement.create({
      data: {
        farmerId: data.farmerId,
        productId: data.productId,
        quantity: qty,
        unitPrice: price,
        totalAmount,
        supplierNotes: data.supplierNotes || null,
        createdBy: data.createdBy || "Admin"
      }
    });

    // 2. Automatically Increase Product Inventory & Update Cost Price + Farmer Info
    await prisma.product.update({
      where: { id: data.productId },
      data: {
        inventory: { increment: qty },
        costPrice: price,
        farmerId: data.farmerId,
        farmerName: farmer.name
      }
    });

    // 3. Create Corresponding Farmer Transaction Audit Log
    await prisma.farmerTransaction.create({
      data: {
        farmerId: data.farmerId,
        productId: data.productId,
        productName: product.name,
        quantity: qty,
        unitCost: price,
        totalCost: totalAmount,
        commission: (totalAmount * Number(farmer.commissionRate || 5.0)) / 100,
        notes: data.supplierNotes || `Procurement order #${procurement.id.slice(0, 8)}`
      }
    });

    // 4. Update Farmer Products Supplied Array if not present
    if (!farmer.productsSupplied.includes(product.name)) {
      await prisma.farmer.update({
        where: { id: data.farmerId },
        data: {
          productsSupplied: { push: product.name }
        }
      });
    }

    revalidatePath("/admin/procurement");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/financials");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin/products");
    revalidatePath("/admin/farmers");

    return { success: true, procurement };
  } catch (error: any) {
    console.error("Error creating procurement record:", error);
    return { success: false, error: error.message || "Failed to create procurement record." };
  }
}
