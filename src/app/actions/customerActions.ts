"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: "desc" }
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((u) => {
      const allOrders = u.orders || [];
      const nonCancelledOrders = allOrders.filter(o => o.status !== "CANCELLED");
      const activeOrders = allOrders.filter(o => o.status !== "COMPLETED" && o.status !== "CANCELLED");
      const completedOrders = allOrders.filter(o => o.status === "COMPLETED");
      const cancelledOrders = allOrders.filter(o => o.status === "CANCELLED");

      const totalSpent = nonCancelledOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const defaultAddress = u.addresses?.find(a => a.isDefault) || u.addresses?.[0];
      const addressString = u.address || (defaultAddress ? `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state}` : "No address specified");
      const lastOrderDate = allOrders.length > 0 ? allOrders[0].createdAt : null;

      return {
        ...u,
        fullName: `${u.firstName} ${u.lastName}`.trim(),
        deliveryAddress: addressString,
        totalOrdersCount: allOrders.length,
        totalAmountSpent: totalSpent,
        lastOrderDate,
        activeOrdersCount: activeOrders.length,
        completedOrdersCount: completedOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
      };
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export async function updateCustomerProfile(userId: string, data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  altPhoneNumber?: string;
  address?: string;
}) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Customer profile not found." };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phoneNumber || "",
        altPhoneNumber: data.altPhoneNumber || "",
        address: data.address || ""
      }
    });

    // Also update/upsert default Address if address string provided
    if (data.address) {
      const defaultAddress = await prisma.address.findFirst({
        where: { userId, isDefault: true }
      });

      if (defaultAddress) {
        await prisma.address.update({
          where: { id: defaultAddress.id },
          data: { street: data.address }
        });
      } else {
        await prisma.address.create({
          data: {
            userId,
            street: data.address,
            city: "Lagos",
            state: "Lagos",
            isDefault: true
          }
        });
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/customers");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/delivery");
    revalidatePath("/rider/dashboard");

    return { 
      success: true, 
      user: {
        ...updatedUser,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`
      }
    };
  } catch (error: any) {
    console.error("Error updating customer profile:", error);
    return { success: false, error: error.message || "Failed to update profile." };
  }
}

export async function toggleCustomerStatus(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { success: false, error: "User not found" };

    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath("/admin/customers");
    return { success: true, status: newStatus };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle status." };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete customer." };
  }
}
