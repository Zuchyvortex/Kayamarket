"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createOrder(data: {
  userId?: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  deliveryDate?: string;
  deliveryTime?: string;
  paymentMethod?: string;
  items: {
    productId?: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  deliveryFee?: number;
  notes?: string;
}) {
  try {
    const orderNumber = `KM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const deliveryFee = data.deliveryFee ?? 2000;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId || null,
        customerName: data.customerName,
        customerPhone: data.customerPhone || null,
        deliveryAddress: data.deliveryAddress,
        deliveryDate: data.deliveryDate || null,
        deliveryTime: data.deliveryTime || null,
        paymentMethod: data.paymentMethod || "Bank Transfer",
        paymentStatus: "PAID",
        totalAmount: data.totalAmount,
        deliveryFee,
        notes: data.notes || null,
        status: "ORDER_PLACED",
        items: {
          create: data.items.map(item => ({
            productId: item.productId || null,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
          }))
        },
        timeline: {
          create: {
            status: "ORDER_PLACED",
            title: "Order Placed",
            description: "Customer successfully placed order.",
            updatedBy: "Customer"
          }
        }
      },
      include: {
        items: true,
        timeline: true
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath("/dashboard");
    return { success: true, order };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return { success: false, error: error.message || "Failed to place order." };
  }
}

export async function getOrders(filters?: {
  search?: string;
  status?: string;
  riderId?: string;
  userId?: string;
}) {
  try {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.riderId) {
      where.riderId = filters.riderId;
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status as OrderStatus;
    }

    if (filters?.search) {
      const q = filters.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q, mode: "insensitive" } },
        { deliveryAddress: { contains: q, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        rider: true,
        timeline: {
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  updatedBy: string = "Admin",
  notes?: string
) {
  try {
    const statusTitles: Record<OrderStatus, string> = {
      ORDER_PLACED: "Order Placed",
      ORDER_CONFIRMED: "Order Confirmed",
      PREPARING: "Preparing Order",
      PACKED: "Packed",
      ASSIGNED_TO_RIDER: "Assigned to Rider",
      OUT_FOR_DELIVERY: "Out for Delivery",
      ARRIVING_SOON: "Arriving Soon",
      DELIVERED: "Delivered",
      COMPLETED: "Completed & Verified",
      CANCELLED: "Order Cancelled"
    };

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        timeline: {
          create: {
            status: newStatus,
            title: statusTitles[newStatus] || newStatus,
            description: notes || `Order status updated to ${statusTitles[newStatus] || newStatus}`,
            updatedBy
          }
        }
      },
      include: {
        items: true,
        rider: true,
        timeline: { orderBy: { createdAt: "asc" } }
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath("/dashboard");
    revalidatePath("/rider/dashboard");
    return { success: true, order: updated };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message || "Failed to update order status." };
  }
}

export async function assignRiderToOrder(orderId: string, riderId: string) {
  try {
    const rider = await prisma.rider.findUnique({ where: { id: riderId } });
    if (!rider) return { success: false, error: "Rider not found" };

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        riderId: rider.id,
        status: "ASSIGNED_TO_RIDER",
        timeline: {
          create: {
            status: "ASSIGNED_TO_RIDER",
            title: "Assigned to Rider",
            description: `Order assigned to rider ${rider.fullName} (${rider.riderId})`,
            updatedBy: "Admin"
          }
        }
      },
      include: {
        rider: true,
        timeline: { orderBy: { createdAt: "asc" } }
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/delivery");
    revalidatePath("/rider/dashboard");
    revalidatePath("/dashboard");
    return { success: true, order: updated };
  } catch (error: any) {
    console.error("Error assigning rider:", error);
    return { success: false, error: error.message || "Failed to assign rider." };
  }
}

export async function confirmDeliveryByCustomer(data: {
  orderId: string;
  signatureType: "DRAWN" | "TYPED";
  signatureData: string;
  proofCustomerName: string;
}) {
  try {
    const updated = await prisma.order.update({
      where: { id: data.orderId },
      data: {
        status: "COMPLETED",
        customerConfirmed: true,
        confirmedAt: new Date(),
        signatureType: data.signatureType,
        signatureData: data.signatureData,
        proofCustomerName: data.proofCustomerName,
        timeline: {
          create: {
            status: "COMPLETED",
            title: "Delivery Confirmed & Completed",
            description: `Customer ${data.proofCustomerName} confirmed receipt with digital proof of delivery.`,
            updatedBy: `Customer (${data.proofCustomerName})`
          }
        }
      },
      include: {
        items: true,
        rider: true,
        timeline: { orderBy: { createdAt: "asc" } }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/orders");
    revalidatePath("/rider/dashboard");
    return { success: true, order: updated };
  } catch (error: any) {
    console.error("Error confirming delivery:", error);
    return { success: false, error: error.message || "Failed to confirm delivery." };
  }
}
