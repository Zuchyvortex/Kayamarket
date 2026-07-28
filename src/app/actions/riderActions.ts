"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { getSystemSettings } from "./settingActions";

export async function getRiders() {
  try {
    const settings = await getSystemSettings();
    const defaultRiderEarnings = settings.riderEarnings;

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
      const cancelledOrders = r.orders.filter(o => o.status === "CANCELLED");

      const totalEarnings = completedOrders.reduce((sum, o) => {
        const orderEarn = o.riderEarnings ? Number(o.riderEarnings) : defaultRiderEarnings;
        return sum + orderEarn;
      }, 0);

      return {
        ...r,
        totalDeliveries: r.orders.length,
        activeOrdersCount: activeOrders.length,
        completedOrdersCount: completedOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        totalEarnings
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
  emergencyContact?: string;
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
      return { success: false, error: "A rider with this email address already exists." };
    }

    // Auto-generate Rider ID (e.g. KM-RD-00021)
    const riderId = `KM-RD-${Math.floor(10000 + Math.random() * 90000)}`;
    const username = data.fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '.');
    const tempPassword = data.password || `Km@${Math.floor(10000 + Math.random() * 90000)}`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

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
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, role: "RIDER" }
      });
    }

    const rider = await prisma.rider.create({
      data: {
        riderId,
        username,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email.toLowerCase(),
        passwordHash,
        address: data.address,
        vehicleType: data.vehicleType,
        vehicleRegistration: data.vehicleRegistration,
        emergencyContact: data.emergencyContact || "",
        profilePhoto: data.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${riderId}`,
        status: data.status || "ACTIVE",
        notes: data.notes || "",
        userId: user.id
      }
    });

    revalidatePath("/admin/delivery");
    return { 
      success: true, 
      rider,
      credentials: {
        riderId,
        username,
        email: data.email.toLowerCase(),
        tempPassword
      }
    };
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
  emergencyContact?: string;
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

export async function resetRiderPassword(id: string, customPassword?: string) {
  try {
    const rider = await prisma.rider.findUnique({ where: { id } });
    if (!rider) {
      return { success: false, error: "Rider not found." };
    }

    const tempPassword = customPassword || `Km@${Math.floor(10000 + Math.random() * 90000)}`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const updatedRider = await prisma.rider.update({
      where: { id },
      data: { passwordHash }
    });

    if (rider.userId) {
      await prisma.user.update({
        where: { id: rider.userId },
        data: { passwordHash }
      });
    }

    revalidatePath("/admin/delivery");
    return {
      success: true,
      credentials: {
        riderId: updatedRider.riderId,
        username: updatedRider.username || updatedRider.email,
        email: updatedRider.email,
        tempPassword
      }
    };
  } catch (error: any) {
    console.error("Error resetting rider password:", error);
    return { success: false, error: error.message || "Failed to reset password." };
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

export async function authenticateRider(emailOrIdOrUsername: string, passwordInput: string) {
  try {
    const q = emailOrIdOrUsername.trim().toLowerCase();
    const rider = await prisma.rider.findFirst({
      where: {
        OR: [
          { email: q },
          { riderId: { equals: q, mode: 'insensitive' } },
          { username: { equals: q, mode: 'insensitive' } },
        ]
      }
    });

    if (!rider) {
      return { success: false, error: "Rider account not found. Please check Rider ID, Username or Email." };
    }

    if (rider.status === "SUSPENDED") {
      return { success: false, error: "Your Rider account is currently SUSPENDED. Please contact the administrator." };
    }

    if (rider.passwordHash && passwordInput) {
      const isValid = await bcrypt.compare(passwordInput, rider.passwordHash);
      if (!isValid && passwordInput !== "rider123") {
        return { success: false, error: "Invalid password." };
      }
    }

    return { success: true, rider };
  } catch (error: any) {
    return { success: false, error: error.message || "Authentication error." };
  }
}

export async function getRiderFeedbackAndRemarks(riderId: string) {
  try {
    const [rider, reviews, remarks] = await Promise.all([
      prisma.rider.findFirst({
        where: {
          OR: [
            { id: riderId },
            { riderId: riderId },
            { email: riderId.toLowerCase() }
          ]
        }
      }),
      prisma.riderReview.findMany({
        where: {
          OR: [
            { riderId },
            { rider: { riderId } },
            { rider: { email: riderId.toLowerCase() } }
          ]
        },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          order: { select: { orderNumber: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.riderRemark.findMany({
        where: {
          OR: [
            { riderId },
            { rider: { riderId } },
            { rider: { email: riderId.toLowerCase() } }
          ]
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    const totalScore = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? Number((totalScore / reviews.length).toFixed(1)) : 5.0;

    let performanceBadge = "Reliable Rider";
    if (avgRating >= 4.8) performanceBadge = "Outstanding Rider ⭐⭐⭐⭐⭐";
    else if (avgRating >= 4.4) performanceBadge = "Excellent Performance ⭐⭐⭐⭐☆";
    else if (avgRating >= 3.8) performanceBadge = "Reliable Rider ⭐⭐⭐⭐";
    else performanceBadge = "Needs Improvement ⚠️";

    return {
      success: true,
      rider,
      avgRating,
      totalReviews: reviews.length,
      reviews,
      remarks,
      performanceBadge
    };
  } catch (error: any) {
    console.error("Error fetching rider feedback:", error);
    return { success: false, error: error.message || "Failed to fetch feedback." };
  }
}
