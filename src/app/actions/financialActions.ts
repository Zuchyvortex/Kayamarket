"use server";

import { prisma } from "@/lib/prisma";

export async function getFinancialSummary() {
  try {
    const [orders, procurements, products, farmers, farmerTxs] = await Promise.all([
      prisma.order.findMany({
        where: { paymentStatus: "PAID" },
        include: {
          items: {
            include: { product: true }
          }
        }
      }),
      prisma.procurement.findMany({
        include: { farmer: true, product: true }
      }),
      prisma.product.findMany({
        where: { isActive: true }
      }),
      prisma.farmer.findMany(),
      prisma.farmerTransaction.findMany()
    ]);

    // Financial Metrics Calculation
    let totalSalesRevenue = 0;
    let deliveryRevenue = 0;
    let productSalesRevenue = 0;
    let costOfGoodsSold = 0;

    orders.forEach(order => {
      const orderTotal = Number(order.totalAmount || 0);
      const delivery = Number(order.deliveryFee || 0);
      const subtotal = Number(order.subtotal || (orderTotal - delivery));

      totalSalesRevenue += orderTotal;
      deliveryRevenue += delivery;
      productSalesRevenue += subtotal;

      // COGS Calculation per item
      order.items.forEach(item => {
        const itemQty = Number(item.quantity || 1);
        const itemCost = Number(item.product?.costPrice || (Number(item.price) * 0.65));
        costOfGoodsSold += itemQty * itemCost;
      });
    });

    const grossProcurementCost = procurements.reduce(
      (sum, p) => sum + Number(p.totalAmount || 0), 0
    );

    const totalFarmerCommissions = farmerTxs.reduce(
      (sum, t) => sum + Number(t.commission || 0), 0
    );

    const inventoryValuation = products.reduce(
      (sum, p) => sum + (Number(p.inventory || 0) * Number(p.costPrice || 0)), 0
    );

    const grossProfit = productSalesRevenue - costOfGoodsSold;
    const netProfit = grossProfit + deliveryRevenue - totalFarmerCommissions;

    return {
      totalSalesRevenue,
      deliveryRevenue,
      productSalesRevenue,
      costOfGoodsSold,
      grossProfit,
      netProfit,
      grossProcurementCost,
      totalFarmerCommissions,
      inventoryValuation,
      paidOrdersCount: orders.length,
      procurementsCount: procurements.length,
      farmersCount: farmers.length,
      activeProductsCount: products.length
    };
  } catch (error) {
    console.error("Error generating financial summary:", error);
    return {
      totalSalesRevenue: 0,
      deliveryRevenue: 0,
      productSalesRevenue: 0,
      costOfGoodsSold: 0,
      grossProfit: 0,
      netProfit: 0,
      grossProcurementCost: 0,
      totalFarmerCommissions: 0,
      inventoryValuation: 0,
      paidOrdersCount: 0,
      procurementsCount: 0,
      farmersCount: 0,
      activeProductsCount: 0
    };
  }
}
