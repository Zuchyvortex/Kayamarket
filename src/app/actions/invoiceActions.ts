"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrGetInvoice(orderId: string) {
  try {
    const existing = await prisma.invoice.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            items: true,
            rider: true,
            user: true
          }
        }
      }
    });

    if (existing) return { success: true, invoice: existing };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        rider: true,
        user: true
      }
    });

    if (!order) return { success: false, error: "Order not found" };

    const invoiceNumber = `INV-2026-${order.orderNumber.replace(/[^0-9]/g, '') || Math.floor(1000 + Math.random() * 9000)}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        userId: order.userId || null,
        customerName: order.customerName,
        customerEmail: order.user?.email || null,
        customerPhone: order.customerPhone || null,
        customerAddress: order.deliveryAddress,
        subtotal: order.subtotal || Math.max(0, Number(order.totalAmount) - Number(order.deliveryFee)),
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod || "Bank Transfer",
        paymentStatus: order.paymentStatus || "PAID",
        riderName: order.rider?.fullName || "Kaya Express Rider",
        riderIdCode: order.rider?.riderId || "RD-001",
        orderDate: order.createdAt,
        deliveryDate: order.confirmedAt || new Date()
      },
      include: {
        order: {
          include: {
            items: true,
            rider: true,
            user: true
          }
        }
      }
    });

    return { success: true, invoice };
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    return { success: false, error: error.message };
  }
}

export async function getCustomerInvoices(userId: string) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: {
        order: {
          include: { items: true, rider: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    return [];
  }
}

export async function getAllInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
          include: { items: true, rider: true }
        },
        user: true
      },
      orderBy: { createdAt: "desc" }
    });

    return invoices;
  } catch (error) {
    console.error("Error fetching all invoices:", error);
    return [];
  }
}
