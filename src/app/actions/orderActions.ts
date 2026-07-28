"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSystemSettings } from "./settingActions";
import { createOrGetInvoice } from "./invoiceActions";

export async function createOrder(data: {
  userId?: string;
  customerName: string;
  customerPhone?: string;
  customerAltPhone?: string;
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
  subtotal?: number;
  deliveryFee?: number;
  notes?: string;
}) {
  try {
    const settings = await getSystemSettings();
    const orderNumber = `KM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const deliveryFee = data.deliveryFee ?? settings.deliveryFee;
    const riderEarnings = settings.riderEarnings;
    const platformShare = Math.max(0, deliveryFee - riderEarnings);
    const subtotal = data.subtotal ?? Math.max(0, data.totalAmount - deliveryFee);

    // If userId provided, check for alt phone
    let altPhone = data.customerAltPhone || null;
    if (data.userId && !altPhone) {
      const userObj = await prisma.user.findUnique({ where: { id: data.userId } });
      if (userObj?.altPhoneNumber) {
        altPhone = userObj.altPhoneNumber;
      }
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: data.userId || null,
        customerName: data.customerName,
        customerPhone: data.customerPhone || null,
        customerAltPhone: altPhone,
        deliveryAddress: data.deliveryAddress,
        deliveryDate: data.deliveryDate || null,
        deliveryTime: data.deliveryTime || null,
        paymentMethod: data.paymentMethod || "Bank Transfer",
        paymentStatus: "PAID",
        subtotal,
        totalAmount: data.totalAmount,
        deliveryFee,
        riderEarnings,
        platformShare,
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
        timeline: true,
        user: true
      }
    });

    // Reduce Product Inventory & check for Low Stock Alerts (Requirement 1)
    for (const item of data.items) {
      if (item.productId) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          const newStock = Math.max(0, prod.inventory - item.quantity);
          await prisma.product.update({
            where: { id: item.productId },
            data: { inventory: newStock }
          });

          if (newStock <= prod.minStockThreshold) {
            await prisma.notification.create({
              data: {
                targetRole: "ADMIN",
                title: newStock === 0 ? "OUT OF STOCK ALERT" : "LOW STOCK ALERT",
                message: `Product "${prod.name}" has ${newStock} units left in stock (Min Threshold: ${prod.minStockThreshold}).`,
                link: "/admin/inventory",
                type: "INVENTORY"
              }
            });
          }
        }
      }
    }

    // Admin Notification for New Order (Requirement 8)
    await prisma.notification.create({
      data: {
        targetRole: "ADMIN",
        title: "New Order Received",
        message: `Order #${order.orderNumber} placed by ${data.customerName} for ₦${data.totalAmount.toLocaleString()}.`,
        link: "/admin/orders",
        type: "ORDER"
      }
    });

    // Customer Notification
    if (data.userId) {
      await prisma.notification.create({
        data: {
          targetRole: "CUSTOMER",
          userId: data.userId,
          title: "Order Placed Successfully",
          message: `Your order #${order.orderNumber} has been received and is being processed.`,
          link: "/dashboard",
          type: "ORDER"
        }
      });
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");
    revalidatePath("/admin/inventory");
    revalidatePath("/products");
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
}) {
  try {
    const where: any = {};
    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        rider: true,
        user: true,
        invoice: true,
        riderReview: true,
        timeline: { orderBy: { createdAt: "asc" } }
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
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, rider: true, user: true }
    });

    if (!existingOrder) {
      return { success: false, error: "Order not found" };
    }

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

    // If cancelling order, restore inventory stock
    if (newStatus === "CANCELLED" && existingOrder.status !== "CANCELLED") {
      for (const item of existingOrder.items) {
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { inventory: { increment: item.quantity } }
          });
        }
      }

      if (existingOrder.riderId) {
        await prisma.notification.create({
          data: {
            targetRole: "RIDER",
            riderId: existingOrder.riderId,
            title: "Delivery Cancelled",
            message: `Order #${existingOrder.orderNumber} has been cancelled.`,
            link: "/rider/dashboard",
            type: "DELIVERY"
          }
        });
      }
    }

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
        user: true,
        invoice: true,
        timeline: { orderBy: { createdAt: "asc" } }
      }
    });

    // Send status notifications (Requirement 8)
    if (existingOrder.userId) {
      await prisma.notification.create({
        data: {
          targetRole: "CUSTOMER",
          userId: existingOrder.userId,
          title: `Order Status: ${statusTitles[newStatus] || newStatus}`,
          message: `Your order #${existingOrder.orderNumber} is now ${statusTitles[newStatus] || newStatus}.`,
          link: "/dashboard",
          type: "ORDER"
        }
      });
    }

    // Auto Invoice Generation on Delivered / Completed (Requirement 6)
    if (newStatus === "DELIVERED" || newStatus === "COMPLETED") {
      await createOrGetInvoice(orderId);
      
      await prisma.notification.create({
        data: {
          targetRole: "ADMIN",
          title: "Delivery Confirmed",
          message: `Order #${existingOrder.orderNumber} has been delivered & completed.`,
          link: "/admin/orders",
          type: "DELIVERY"
        }
      });

      if (existingOrder.userId) {
        await prisma.notification.create({
          data: {
            targetRole: "CUSTOMER",
            userId: existingOrder.userId,
            title: "Invoice Ready & Review Request",
            message: `Your invoice for Order #${existingOrder.orderNumber} is now ready. Please take a moment to rate your product and rider!`,
            link: "/dashboard",
            type: "INVOICE"
          }
        });
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");
    revalidatePath("/admin/inventory");
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
        user: true,
        timeline: { orderBy: { createdAt: "asc" } }
      }
    });

    // Notify Rider (Requirement 8)
    await prisma.notification.create({
      data: {
        targetRole: "RIDER",
        riderId: rider.id,
        title: "New Delivery Assigned",
        message: `Order #${updated.orderNumber} for ${updated.customerName} has been assigned to you.`,
        link: "/rider/dashboard",
        type: "DELIVERY"
      }
    });

    // Notify Customer
    if (updated.userId) {
      await prisma.notification.create({
        data: {
          targetRole: "CUSTOMER",
          userId: updated.userId,
          title: "Dispatch Rider Assigned",
          message: `Rider ${rider.fullName} (${rider.phoneNumber}) has been assigned to deliver Order #${updated.orderNumber}.`,
          link: "/dashboard",
          type: "ORDER"
        }
      });
    }

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
        user: true,
        timeline: { orderBy: { createdAt: "asc" } }
      }
    });

    // Generate Invoice automatically (Requirement 6)
    await createOrGetInvoice(data.orderId);

    // Notify Admin of Delivery Confirmation (Requirement 8)
    await prisma.notification.create({
      data: {
        targetRole: "ADMIN",
        title: "Customer Confirmed Delivery",
        message: `${data.proofCustomerName} signed & confirmed delivery for Order #${updated.orderNumber}.`,
        link: "/admin/orders",
        type: "DELIVERY"
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/customers");
    revalidatePath("/rider/dashboard");
    return { success: true, order: updated };
  } catch (error: any) {
    console.error("Error confirming delivery:", error);
    return { success: false, error: error.message || "Failed to confirm delivery." };
  }
}
