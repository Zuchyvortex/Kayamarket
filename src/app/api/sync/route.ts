import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seedHelper";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await ensureSeedData();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const riderId = searchParams.get("riderId");
    const role = searchParams.get("role");

    let ordersWhere: any = {};
    if (role === "CUSTOMER" && userId) {
      const customerUser = await prisma.user.findUnique({ where: { id: userId } });
      if (customerUser) {
        ordersWhere.OR = [
          { userId: userId },
          { user: { id: userId } },
          { user: { email: customerUser.email } },
          ...(customerUser.phoneNumber ? [{ customerPhone: customerUser.phoneNumber }] : []),
          ...(customerUser.altPhoneNumber ? [{ customerAltPhone: customerUser.altPhoneNumber }] : [])
        ];
      } else {
        ordersWhere.userId = userId;
      }
    } else if (role === "RIDER" && riderId) {
      ordersWhere.OR = [
        { riderId: riderId },
        { rider: { id: riderId } },
        { rider: { riderId: riderId } },
        { rider: { email: riderId.toLowerCase() } }
      ];
    }

    const [orders, riders] = await Promise.all([
      prisma.order.findMany({
        where: ordersWhere,
        include: {
          items: true,
          rider: true,
          timeline: { orderBy: { createdAt: "asc" } }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.rider.findMany({
        include: {
          orders: true
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      orders,
      riders
    });
  } catch (error: any) {
    console.error("Sync API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch live updates" },
      { status: 500 }
    );
  }
}

