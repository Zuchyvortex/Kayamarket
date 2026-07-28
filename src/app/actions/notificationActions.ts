"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNotification(data: {
  targetRole: "ADMIN" | "RIDER" | "CUSTOMER";
  userId?: string;
  riderId?: string;
  title: string;
  message: string;
  link?: string;
  type?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        targetRole: data.targetRole,
        userId: data.userId || null,
        riderId: data.riderId || null,
        title: data.title,
        message: data.message,
        link: data.link || null,
        type: data.type || "SYSTEM"
      }
    });
    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

export async function getNotifications(role: "ADMIN" | "RIDER" | "CUSTOMER", targetId?: string) {
  try {
    const whereClause: any = { targetRole: role };
    if (role === "CUSTOMER" && targetId) {
      whereClause.userId = targetId;
    } else if (role === "RIDER" && targetId) {
      whereClause.riderId = targetId;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 30
    });

    const unreadCount = await prisma.notification.count({
      where: { ...whereClause, isRead: false }
    });

    return { success: true, notifications, unreadCount };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification read:", error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead(role: "ADMIN" | "RIDER" | "CUSTOMER", targetId?: string) {
  try {
    const whereClause: any = { targetRole: role, isRead: false };
    if (role === "CUSTOMER" && targetId) {
      whereClause.userId = targetId;
    } else if (role === "RIDER" && targetId) {
      whereClause.riderId = targetId;
    }

    await prisma.notification.updateMany({
      where: whereClause,
      data: { isRead: true }
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    return { success: false };
  }
}
