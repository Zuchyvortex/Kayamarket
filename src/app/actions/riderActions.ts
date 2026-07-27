"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getRiders() {
  try {
    const riders = await prisma.rider.findMany({
      include: {
        orders: {
          include: {
            items: true
          },
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return riders.map(r => {
      const activeOrders = r.orders.filter(o => o.status !== "COMPLETED" && o.status !== "CANCELLED");
      const completedOrders = r.orders.filter(o => o.status === "COMPLETED");
      return {
        ...r,
        activeOrdersCount: activeOrders.length,
        completedOrdersCount: completedOrders.length
      };
    });
  } catch (error) {
    console.error("Error fetching riders:", error);
    return [];
  }
}

export async function createRider(data: {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  vehicleType: "MOTORCYCLE" | "CAR" | "VAN";
  vehicleRegistration: string;
  profilePhoto?: string;
  status?: "ACTIVE" | "OFFLINE" | "SUSPENDED";
  notes?: string;
  password?: string;
}) {
  try {
    const existingRider = await prisma.rider.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingRider) {
      return { success: false, error: "A rider with this email already exists." };
    }

    // Auto-generate Rider ID (e.g. RIDER-4821)
    const riderId = `RIDER-${Math.floor(1000 + Math.random() * 9000)}`;
    const passwordToUse = data.password || "rider123";
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordToUse, salt);

    // Create user account with RIDER role if not existing
    let user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (!user) {
      const nameParts = data.fullName.trim().split(" ");
      const firstName = nameParts[0] || data.fullName;
      const lastName = nameParts.slice(1).join(" ") || "Rider";
      user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          firstName,
          lastName,
          phoneNumber: data.phoneNumber,
          passwordHash,
          role: "RIDER"
        }
      });
    }

    const rider = await prisma.rider.create({
      data: {
        riderId,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email.toLowerCase(),
        passwordHash,
        address: data.address,
        vehicleType: data.vehicleType,
        vehicleRegistration: data.vehicleRegistration,
        profilePhoto: data.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${riderId}`,
        status: data.status || "ACTIVE",
        notes: data.notes || "",
        userId: user.id
      }
    });

    revalidatePath("/admin/delivery");
    return { success: true, rider };
  } catch (error: any) {
    console.error("Error creating rider:", error);
    return { success: false, error: error.message || "Failed to create rider." };
  }
}

export async function updateRider(id: string, data: {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  vehicleType?: "MOTORCYCLE" | "CAR" | "VAN";
  vehicleRegistration?: string;
  profilePhoto?: string;
  status?: "ACTIVE" | "OFFLINE" | "SUSPENDED";
  notes?: string;
}) {
  try {
    const updated = await prisma.rider.update({
      where: { id },
      data
    });

    revalidatePath("/admin/delivery");
    return { success: true, rider: updated };
  } catch (error: any) {
    console.error("Error updating rider:", error);
    return { success: false, error: error.message || "Failed to update rider." };
  }
}

export async function updateRiderStatus(id: string, status: "ACTIVE" | "OFFLINE" | "SUSPENDED") {
  try {
    const updated = await prisma.rider.update({
      where: { id },
      data: { status }
    });

    revalidatePath("/admin/delivery");
    return { success: true, rider: updated };
  } catch (error: any) {
    console.error("Error changing rider status:", error);
    return { success: false, error: error.message || "Failed to change status." };
  }
}

export async function deleteRider(id: string) {
  try {
    await prisma.rider.delete({
      where: { id }
    });

    revalidatePath("/admin/delivery");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting rider:", error);
    return { success: false, error: error.message || "Failed to delete rider." };
  }
}

export async function getRiderProfile(riderIdOrEmail: string) {
  try {
    const rider = await prisma.rider.findFirst({
      where: {
        OR: [
          { id: riderIdOrEmail },
          { riderId: riderIdOrEmail },
          { email: riderIdOrEmail.toLowerCase() }
        ]
      },
      include: {
        orders: {
          include: {
            items: true,
            rider: true,
            timeline: { orderBy: { createdAt: "desc" } }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!rider) return null;

    const assignedDeliveries = rider.orders.filter(o => o.status !== "COMPLETED" && o.status !== "CANCELLED");
    const completedDeliveries = rider.orders.filter(o => o.status === "COMPLETED");

    return {
      rider,
      assignedDeliveries,
      completedDeliveries
    };
  } catch (error) {
    console.error("Error fetching rider profile:", error);
    return null;
  }
}
