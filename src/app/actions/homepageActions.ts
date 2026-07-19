"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getHomepageConfig() {
  let config = await prisma.homepageConfig.findUnique({
    where: { id: "default" }
  });
  
  if (!config) {
    config = await prisma.homepageConfig.create({
      data: { id: "default" }
    });
  }
  
  return config;
}

export async function updateHomepageConfig(data: {
  heroBannerImage?: string;
  heroBannerTitle?: string;
  heroBannerSubtitle?: string;
  heroBannerLink?: string;
  promotionalBanners?: string[];
  videoUrl?: string;
  announcementText?: string;
  announcementActive?: boolean;
  flashSaleActive?: boolean;
}) {
  const config = await prisma.homepageConfig.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data }
  });

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { success: true, config };
}
