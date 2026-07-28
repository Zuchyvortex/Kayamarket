"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSystemSettings() {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: "default" }
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: "default",
          deliveryFee: 4000,
          riderEarnings: 2000,
          farmerCommissionRate: 5.00
        }
      });
    }

    const deliveryFeeNum = Number(settings.deliveryFee);
    const riderEarningsNum = Number(settings.riderEarnings);
    const platformShareNum = Math.max(0, deliveryFeeNum - riderEarningsNum);
    const farmerCommissionRateNum = Number(settings.farmerCommissionRate || 5.00);

    return {
      deliveryFee: deliveryFeeNum,
      riderEarnings: riderEarningsNum,
      platformShare: platformShareNum,
      farmerCommissionRate: farmerCommissionRateNum,
      updatedAt: settings.updatedAt
    };
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return {
      deliveryFee: 4000,
      riderEarnings: 2000,
      platformShare: 2000,
      farmerCommissionRate: 5.00,
      updatedAt: new Date()
    };
  }
}

export async function updateSystemSettings(data: {
  deliveryFee: number;
  riderEarnings: number;
  farmerCommissionRate?: number;
}) {
  try {
    const updated = await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: {
        deliveryFee: data.deliveryFee,
        riderEarnings: data.riderEarnings,
        farmerCommissionRate: data.farmerCommissionRate ?? 5.00
      },
      create: {
        id: "default",
        deliveryFee: data.deliveryFee,
        riderEarnings: data.riderEarnings,
        farmerCommissionRate: data.farmerCommissionRate ?? 5.00
      }
    });

    revalidatePath("/admin/delivery");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/analytics");
    revalidatePath("/checkout");
    
    return { 
      success: true, 
      settings: {
        deliveryFee: Number(updated.deliveryFee),
        riderEarnings: Number(updated.riderEarnings),
        platformShare: Math.max(0, Number(updated.deliveryFee) - Number(updated.riderEarnings)),
        farmerCommissionRate: Number(updated.farmerCommissionRate || 5.00)
      } 
    };
  } catch (error: any) {
    console.error("Error updating system settings:", error);
    return { success: false, error: error.message || "Failed to update settings." };
  }
}
