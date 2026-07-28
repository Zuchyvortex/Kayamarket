"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        addresses: true,
        invoices: {
          orderBy: { createdAt: "desc" }
        },
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

      const invoiceHistory = u.invoices || [];
      const latestInvoice = invoiceHistory[0] || null;

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
        latestInvoice,
        invoiceHistory
      };
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export async function getCustomerProfileById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true
      }
    });

    if (!user) return { success: false, error: "Customer not found." };

    return {
      success: true,
      user: {
        ...user,
        fullName: `${user.firstName} ${user.lastName}`.trim()
      }
    };
  } catch (error: any) {
    console.error("Error getting customer profile:", error);
    return { success: false, error: error.message };
  }
}

import bcrypt from "bcryptjs";

export async function updateCustomerProfile(userId: string, data: {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phoneNumber?: string;
  altPhoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  profileImage?: string;
  password?: string;
}) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Customer profile not found." };
    }

    const updatePayload: any = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      username: data.username ? data.username.trim() : user.username,
      phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : user.phoneNumber,
      altPhoneNumber: data.altPhoneNumber !== undefined ? data.altPhoneNumber : user.altPhoneNumber,
      address: data.address !== undefined ? data.address : user.address,
      city: data.city !== undefined ? data.city : user.city,
      state: data.state !== undefined ? data.state : user.state,
      ...(data.profileImage ? { profileImage: data.profileImage } : {})
    };

    if (data.password && data.password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.passwordHash = await bcrypt.hash(data.password.trim(), salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatePayload
    });

    // Also update or create default Address
    if (data.address || data.city || data.state) {
      const defaultAddress = await prisma.address.findFirst({
        where: { userId, isDefault: true }
      });

      if (defaultAddress) {
        await prisma.address.update({
          where: { id: defaultAddress.id },
          data: {
            street: data.address || defaultAddress.street,
            city: data.city || defaultAddress.city,
            state: data.state || defaultAddress.state
          }
        });
      } else {
        await prisma.address.create({
          data: {
            userId,
            street: data.address || "Main Street",
            city: data.city || "Lagos",
            state: data.state || "Lagos",
            isDefault: true
          }
        });
      }
    }

    // Notify Admin of Customer Profile Update (Requirement 8 & 10)
    await prisma.notification.create({
      data: {
        targetRole: "ADMIN",
        title: "Customer Profile Updated",
        message: `${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email}) updated their profile details.`,
        link: "/admin/customers",
        type: "PROFILE"
      }
    });

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
