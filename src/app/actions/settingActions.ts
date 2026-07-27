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
          riderEarnings: 2000
        }
      });
    }

    const deliveryFeeNum = Number(settings.deliveryFee);
    const riderEarningsNum = Number(settings.riderEarnings);
    const platformShareNum = Math.max(0, deliveryFeeNum - riderEarningsNum);

    return {
      deliveryFee: deliveryFeeNum,
      riderEarnings: riderEarningsNum,
      platformShare: platformShareNum,
      updatedAt: settings.updatedAt
    };
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return {
      deliveryFee: 4000,
      riderEarnings: 2000,
      platformShare: 2000,
      updatedAt: new Date()
    };
  }
}

export async function updateSystemSettings(data: {
  deliveryFee: number;
  riderEarnings: number;
}) {
  try {
    const updated = await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: {
        deliveryFee: data.deliveryFee,
        riderEarnings: data.riderEarnings
      },
      create: {
        id: "default",
        deliveryFee: data.deliveryFee,
        riderEarnings: data.riderEarnings
      }
    });

    revalidatePath("/admin/delivery");
    revalidatePath("/admin/orders");
    revalidatePath("/checkout");
    
    return { 
      success: true, 
      settings: {
        deliveryFee: Number(updated.deliveryFee),
        riderEarnings: Number(updated.riderEarnings),
        platformShare: Math.max(0, Number(updated.deliveryFee) - Number(updated.riderEarnings))
      } 
    };
  } catch (error: any) {
    console.error("Error updating system settings:", error);
    return { success: false, error: error.message || "Failed to update settings." };
  }
}
