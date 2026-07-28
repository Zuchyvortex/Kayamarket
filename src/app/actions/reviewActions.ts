"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// PRODUCT REVIEWS
export async function createProductReview(data: {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  displayName: string;
}) {
  try {
    // Verify user has purchased & received product
    const verifiedOrder = await prisma.order.findFirst({
      where: {
        userId: data.userId,
        status: { in: ["DELIVERED", "COMPLETED"] },
        items: {
          some: { productId: data.productId }
        }
      }
    });

    if (!verifiedOrder) {
      return { 
        success: false, 
        error: "Product review permitted only for verified completed purchases." 
      };
    }

    const review = await prisma.productReview.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        rating: Math.min(5, Math.max(1, data.rating)),
        title: data.title || null,
        comment: data.comment,
        displayName: data.displayName,
        isApproved: true
      },
      include: {
        product: true
      }
    });

    // Notify Admin of product review
    await prisma.notification.create({
      data: {
        targetRole: "ADMIN",
        title: "New Product Review Submitted",
        message: `${data.displayName} gave a ${data.rating}★ rating on "${review.product.name}"`,
        link: `/products/${review.product.slug}`,
        type: "REVIEW"
      }
    });

    revalidatePath(`/products/${review.product.slug}`);
    revalidatePath("/products");
    return { success: true, review };
  } catch (error: any) {
    console.error("Error creating product review:", error);
    return { success: false, error: error.message || "Failed to submit review." };
  }
}

export async function getProductReviews(productId: string) {
  try {
    const reviews = await prisma.productReview.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: "desc" }
    });

    const totalReviews = reviews.length;
    const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 5.0;

    const breakdown = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return { success: true, reviews, totalCount: totalReviews, averageRating, breakdown };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return { success: false, reviews: [], totalCount: 0, averageRating: 5.0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  }
}

// RIDER REVIEWS
export async function createRiderReview(data: {
  orderId: string;
  userId: string;
  rating: number;
  comment?: string;
  deliveryExperience?: string;
}) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { rider: true }
    });

    if (!order || !order.riderId) {
      return { success: false, error: "Associated order or rider not found." };
    }

    const existing = await prisma.riderReview.findUnique({
      where: { orderId: data.orderId }
    });

    if (existing) {
      return { success: false, error: "Feedback has already been submitted for this delivery." };
    }

    const review = await prisma.riderReview.create({
      data: {
        riderId: order.riderId,
        orderId: data.orderId,
        userId: data.userId,
        rating: Math.min(5, Math.max(1, data.rating)),
        comment: data.comment || null,
        deliveryExperience: data.deliveryExperience || null
      }
    });

    // Notify Admin of Rider Review
    await prisma.notification.create({
      data: {
        targetRole: "ADMIN",
        title: "New Rider Review Submitted",
        message: `Customer rated rider ${order.rider?.fullName || ''} ${data.rating}★ for Order #${order.orderNumber}.`,
        link: "/admin/delivery",
        type: "REVIEW"
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/delivery");
    revalidatePath("/rider/dashboard");

    return { success: true, review };
  } catch (error: any) {
    console.error("Error submitting rider review:", error);
    return { success: false, error: error.message || "Failed to submit rider review." };
  }
}

export async function getRiderReviews(riderId: string) {
  try {
    const reviews = await prisma.riderReview.findMany({
      where: { riderId },
      include: {
        user: true,
        order: true
      },
      orderBy: { createdAt: "desc" }
    });

    const totalReviews = reviews.length;
    const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 5.0;

    return { reviews, totalReviews, averageRating };
  } catch (error) {
    console.error("Error fetching rider reviews:", error);
    return { reviews: [], totalReviews: 0, averageRating: 5.0 };
  }
}
