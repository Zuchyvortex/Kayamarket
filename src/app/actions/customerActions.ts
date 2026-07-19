"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      addresses: true,
      orders: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => {
    const completedOrders = u.orders.filter((o) => o.status === "DELIVERED");
    const totalSpent = completedOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0);
    return {
      ...u,
      completedOrdersCount: completedOrders.length,
      totalSpent,
    };
  });
}

export async function toggleCustomerStatus(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { success: false, error: "User not found" };

  const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  await prisma.user.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath("/admin/customers");
  return { success: true, status: newStatus };
}

export async function deleteCustomer(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/customers");
  return { success: true };
}
