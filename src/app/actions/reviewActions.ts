"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// PRODUCT REVIEWS
export async function createProductReview(data: {
  productId: string;
  orderId?: string;
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
        orderId: data.orderId || verifiedOrder.id,
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

export async function createBatchOrderProductReviews(data: {
  orderId: string;
  userId: string;
  displayName: string;
  reviews: Array<{
    productId: string;
    rating: number;
    comment?: string;
  }>;
}) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: data.orderId,
        status: { in: ["DELIVERED", "COMPLETED"] }
      },
      include: { items: true }
    });

    if (!order) {
      return { success: false, error: "Order not found or not yet delivered." };
    }

    const createdReviews = [];
    for (const itemReview of data.reviews) {
      if (!itemReview.productId) continue;
      
      const product = await prisma.product.findUnique({ where: { id: itemReview.productId } });
      if (!product) continue;

      const review = await prisma.productReview.create({
        data: {
          productId: itemReview.productId,
          orderId: data.orderId,
          userId: data.userId,
          rating: Math.min(5, Math.max(1, itemReview.rating)),
          comment: itemReview.comment || `Rated ${itemReview.rating} stars for purchase in Order #${order.orderNumber}`,
          displayName: data.displayName,
          isApproved: true
        }
      });
      createdReviews.push(review);
      revalidatePath(`/products/${product.slug}`);
    }

    revalidatePath("/products");
    revalidatePath("/dashboard");

    return { success: true, count: createdReviews.length };
  } catch (error: any) {
    console.error("Error creating batch product reviews:", error);
    return { success: false, error: error.message || "Failed to submit product reviews." };
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

// RIDER REVIEWS & REMARKS
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

    let performanceBadge = "New Rider";
    if (totalReviews > 0) {
      if (averageRating >= 5.0) performanceBadge = "Outstanding Rider ⭐⭐⭐⭐⭐";
      else if (averageRating >= 4.5) performanceBadge = "Excellent Rider ⭐⭐⭐⭐☆";
      else if (averageRating >= 4.0) performanceBadge = "Reliable Rider ⭐⭐⭐⭐";
      else if (averageRating >= 3.5) performanceBadge = "Good Performer ⭐⭐⭐☆";
      else if (averageRating >= 3.0) performanceBadge = "Needs Improvement ⭐⭐⭐";
      else performanceBadge = "Performance Review Required ⚠️";
    }

    return { reviews, totalReviews, averageRating, performanceBadge };
  } catch (error) {
    console.error("Error fetching rider reviews:", error);
    return { reviews: [], totalReviews: 0, averageRating: 5.0, performanceBadge: "Reliable Rider ⭐⭐⭐⭐" };
  }
}

export async function addRiderRemark(riderId: string, type: "COMMENDATION" | "IMPROVEMENT" | "NOTE", content: string) {
  try {
    const remark = await prisma.riderRemark.create({
      data: {
        riderId,
        type,
        content,
        createdBy: "Admin"
      }
    });

    revalidatePath("/admin/delivery");
    return { success: true, remark };
  } catch (error: any) {
    console.error("Error adding rider remark:", error);
    return { success: false, error: error.message || "Failed to add remark." };
  }
}

export async function getRiderRemarks(riderId: string) {
  try {
    const remarks = await prisma.riderRemark.findMany({
      where: { riderId },
      orderBy: { createdAt: "desc" }
    });
    return remarks;
  } catch (error) {
    console.error("Error fetching rider remarks:", error);
    return [];
  }
}
