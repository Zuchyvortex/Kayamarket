"use server";

import { prisma } from "@/lib/prisma";

export async function getCompleteBusinessAnalytics() {
  try {
    const [
      orders,
      products,
      users,
      riders,
      farmerTransactions,
      riderReviews,
      settings
    ] = await Promise.all([
      prisma.order.findMany({
        include: { items: { include: { product: true } }, rider: true, user: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.findMany({
        include: { category: true, farmer: true, reviews: true },
        orderBy: { inventory: "asc" }
      }),
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        include: { orders: true }
      }),
      prisma.rider.findMany({
        include: { orders: true, reviews: true }
      }),
      prisma.farmerTransaction.findMany({
        include: { farmer: true, product: true }
      }),
      prisma.riderReview.findMany(),
      prisma.systemSetting.findUnique({ where: { id: "default" } })
    ]);

    const defaultDeliveryFee = Number(settings?.deliveryFee || 4000);
    const defaultRiderFee = Number(settings?.riderEarnings || 2000);
    const defaultFarmerCommissionRate = Number(settings?.farmerCommissionRate || 5.0);

    const completedOrders = orders.filter(o => o.status === "COMPLETED" || o.status === "DELIVERED");
    
    // 1. Sales Calculations
    const grossSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const completedGrossSales = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const deliveryRevenue = completedOrders.reduce((sum, o) => sum + Number(o.deliveryFee || defaultDeliveryFee), 0);
    const netSales = completedGrossSales - deliveryRevenue;

    // Time-based Sales
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailySales = completedOrders
      .filter(o => new Date(o.createdAt) >= todayStart)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const weeklySales = completedOrders
      .filter(o => new Date(o.createdAt) >= weekStart)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const monthlySales = completedOrders
      .filter(o => new Date(o.createdAt) >= monthStart)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    // 2. Product Profitability & COGS
    let totalCOGS = 0;
    const productStatsMap: Record<string, {
      id: string;
      name: string;
      sku: string;
      categoryName: string;
      farmerName: string;
      unitPrice: number;
      unitCost: number;
      qtySold: number;
      inventory: number;
      sellingRevenue: number;
      purchaseCost: number;
      productProfit: number;
    }> = {};

    // Initialize map with all products
    products.forEach(p => {
      productStatsMap[p.id] = {
        id: p.id,
        name: p.name,
        sku: p.sku || 'N/A',
        categoryName: p.category?.name || 'General',
        farmerName: p.farmerName || p.farmer?.name || 'Direct Procurement',
        unitPrice: Number(p.price),
        unitCost: Number(p.costPrice || (Number(p.price) * 0.7)), // Fallback 70% if 0
        qtySold: 0,
        inventory: p.inventory,
        sellingRevenue: 0,
        purchaseCost: 0,
        productProfit: 0
      };
    });

    // Populate sold metrics from completed order items
    completedOrders.forEach(o => {
      o.items.forEach(item => {
        const pId = item.productId;
        const itemQty = item.quantity;
        const itemPrice = Number(item.price);
        const itemCost = item.product?.costPrice ? Number(item.product.costPrice) : (itemPrice * 0.7);

        totalCOGS += itemQty * itemCost;

        if (pId && productStatsMap[pId]) {
          productStatsMap[pId].qtySold += itemQty;
          productStatsMap[pId].sellingRevenue += itemQty * itemPrice;
          productStatsMap[pId].purchaseCost += itemQty * itemCost;
          productStatsMap[pId].productProfit = productStatsMap[pId].sellingRevenue - productStatsMap[pId].purchaseCost;
        }
      });
    });

    const productStatsList = Object.values(productStatsMap);
    const bestSellingProducts = [...productStatsList].sort((a, b) => b.qtySold - a.qtySold).slice(0, 5);
    const slowMovingProducts = [...productStatsList].sort((a, b) => a.qtySold - b.qtySold).slice(0, 5);

    // 3. Customer Analytics
    const totalCustomers = users.length;
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newCustomers = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;
    const repeatCustomers = users.filter(u => u.orders.length > 1).length;

    const customerSpendList = users.map(u => {
      const spend = u.orders
        .filter(o => o.status === "COMPLETED" || o.status === "DELIVERED")
        .reduce((sum, o) => sum + Number(o.totalAmount), 0);
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        phone: u.phoneNumber || 'N/A',
        orderCount: u.orders.length,
        lifetimeSpend: spend
      };
    }).sort((a, b) => b.lifetimeSpend - a.lifetimeSpend);

    // 4. Rider & Delivery Analytics (Requirement 8)
    const riderEarningsTotal = completedOrders.reduce((sum, o) => sum + Number(o.riderEarnings || defaultRiderFee), 0);
    const kayaMarketDeliveryEarnings = deliveryRevenue - riderEarningsTotal;

    const totalRiderReviewsCount = riderReviews.length;
    const averageRiderRating = totalRiderReviewsCount > 0
      ? Number((riderReviews.reduce((sum, r) => sum + r.rating, 0) / totalRiderReviewsCount).toFixed(1))
      : 5.0;

    const deliverySuccessRate = orders.length > 0
      ? Number(((completedOrders.length / orders.length) * 100).toFixed(1))
      : 100;

    // 5. Inventory Analytics
    const totalInventoryValueSelling = products.reduce((sum, p) => sum + (p.inventory * Number(p.price)), 0);
    const totalInventoryValueCost = products.reduce((sum, p) => sum + (p.inventory * Number(p.costPrice || (Number(p.price) * 0.7))), 0);
    const lowStockProducts = products.filter(p => p.inventory <= p.minStockThreshold && p.inventory > 0);
    const outOfStockProducts = products.filter(p => p.inventory === 0);

    // 6. Farmer Commission Records
    const totalFarmerCommissions = farmerTransactions.reduce((sum, ft) => sum + Number(ft.commission), 0);

    // 7. Overall Business Profitability
    const grossProfit = netSales - totalCOGS;
    const estimatedNetProfit = grossProfit + kayaMarketDeliveryEarnings - totalFarmerCommissions;

    return {
      success: true,
      timestamp: new Date().toISOString(),
      sales: {
        grossSales,
        completedGrossSales,
        netSales,
        dailySales,
        weeklySales,
        monthlySales
      },
      products: {
        totalCOGS,
        productProfit: netSales - totalCOGS,
        allProductStats: productStatsList,
        bestSellingProducts,
        slowMovingProducts
      },
      customers: {
        totalCustomers,
        newCustomers,
        repeatCustomers,
        customerSpendList
      },
      riders: {
        deliveryRevenue,
        riderEarningsTotal,
        kayaMarketDeliveryEarnings,
        averageRiderRating,
        deliverySuccessRate,
        totalCompletedDeliveries: completedOrders.length
      },
      inventory: {
        totalInventoryValueSelling,
        totalInventoryValueCost,
        lowStockProducts,
        outOfStockProducts,
        totalProductTypes: products.length
      },
      financials: {
        grossRevenue: completedGrossSales,
        cogs: totalCOGS,
        deliveryRevenue,
        kayaMarketDeliveryEarnings,
        totalFarmerCommissions,
        grossProfit,
        estimatedNetProfit
      }
    };
  } catch (error: any) {
    console.error("Error generating business analytics:", error);
    return {
      success: false,
      error: error.message || "Failed to generate analytics data."
    };
  }
}
