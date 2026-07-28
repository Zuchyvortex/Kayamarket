"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInventoryMetrics() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        orderItems: {
          where: {
            order: {
              status: {
                in: [
                  "ORDER_PLACED",
                  "ORDER_CONFIRMED",
                  "PREPARING",
                  "PACKED",
                  "ASSIGNED_TO_RIDER",
                  "OUT_FOR_DELIVERY",
                  "ARRIVING_SOON"
                ]
              }
            }
          }
        }
      },
      orderBy: { name: "asc" }
    });

    const inventoryList = products.map(p => {
      const reservedStock = p.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const currentStock = p.inventory;
      const availableStock = Math.max(0, currentStock - reservedStock);
      const isLowStock = currentStock <= p.minStockThreshold && currentStock > 0;
      const isOutOfStock = currentStock === 0 || availableStock === 0;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || `SKU-${p.id.slice(0, 6).toUpperCase()}`,
        categoryName: p.category.name,
        price: Number(p.price),
        currentStock,
        reservedStock,
        availableStock,
        minStockThreshold: p.minStockThreshold,
        isLowStock,
        isOutOfStock,
        images: p.images
      };
    });

    const totalProductsCount = inventoryList.length;
    const totalPhysicalUnits = inventoryList.reduce((sum, p) => sum + p.currentStock, 0);
    const totalReservedUnits = inventoryList.reduce((sum, p) => sum + p.reservedStock, 0);
    const totalAvailableUnits = inventoryList.reduce((sum, p) => sum + p.availableStock, 0);
    const lowStockCount = inventoryList.filter(p => p.isLowStock).length;
    const outOfStockCount = inventoryList.filter(p => p.isOutOfStock).length;

    return {
      success: true,
      inventoryList,
      summary: {
        totalProductsCount,
        totalPhysicalUnits,
        totalReservedUnits,
        totalAvailableUnits,
        lowStockCount,
        outOfStockCount
      }
    };
  } catch (error: any) {
    console.error("Error fetching inventory metrics:", error);
    return {
      success: false,
      inventoryList: [],
      summary: {
        totalProductsCount: 0,
        totalPhysicalUnits: 0,
        totalReservedUnits: 0,
        totalAvailableUnits: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      }
    };
  }
}

export async function adjustInventoryStock(data: {
  productId: string;
  newInventory: number;
  minStockThreshold?: number;
}) {
  try {
    const product = await prisma.product.update({
      where: { id: data.productId },
      data: {
        inventory: Math.max(0, data.newInventory),
        ...(data.minStockThreshold !== undefined ? { minStockThreshold: Math.max(1, data.minStockThreshold) } : {})
      }
    });

    if (product.inventory <= product.minStockThreshold) {
      await prisma.notification.create({
        data: {
          targetRole: "ADMIN",
          title: product.inventory === 0 ? "OUT OF STOCK ALERT" : "LOW STOCK ALERT",
          message: `Stock level for "${product.name}" manually adjusted to ${product.inventory} units.`,
          link: "/admin/inventory",
          type: "INVENTORY"
        }
      });
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);

    return { success: true, product };
  } catch (error: any) {
    console.error("Error adjusting inventory stock:", error);
    return { success: false, error: error.message || "Failed to adjust stock." };
  }
}
