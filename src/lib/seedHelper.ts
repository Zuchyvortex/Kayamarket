import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function ensureSeedData() {
  try {
    const ridersCount = await prisma.rider.count();
    if (ridersCount === 0) {
      console.log("Seeding sample dispatch riders...");
      const salt = await bcrypt.genSalt(10);
      const defaultPasswordHash = await bcrypt.hash("rider123", salt);

      const sampleRiders = [
        {
          riderId: "RIDER-1001",
          fullName: "Tunde Alao",
          phoneNumber: "+234 802 998 1122",
          email: "tunde@kayamarket.com",
          address: "14 Admiralty Way, Lekki Phase 1, Lagos",
          vehicleType: "MOTORCYCLE" as const,
          vehicleRegistration: "Lagos - AJ211-LS",
          status: "ACTIVE" as const,
          notes: "Fast delivery rider with 5-star customer ratings.",
          profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60"
        },
        {
          riderId: "RIDER-1002",
          fullName: "Emeka Obi",
          phoneNumber: "+234 811 556 7788",
          email: "emeka@kayamarket.com",
          address: "28 Allen Avenue, Ikeja, Lagos",
          vehicleType: "MOTORCYCLE" as const,
          vehicleRegistration: "Lagos - EK441-KJA",
          status: "ACTIVE" as const,
          notes: "Handles mainland and Express orders.",
          profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60"
        },
        {
          riderId: "RIDER-1003",
          fullName: "Ibrahim Musa",
          phoneNumber: "+234 809 333 4455",
          email: "ibrahim@kayamarket.com",
          address: "5 Garki Area 11, Abuja",
          vehicleType: "VAN" as const,
          vehicleRegistration: "Abuja - AB901-FC",
          status: "ACTIVE" as const,
          notes: "Heavy bulk order dispatch driver.",
          profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60"
        }
      ];

      for (const r of sampleRiders) {
        // Create user account if not exists
        const existingUser = await prisma.user.findUnique({ where: { email: r.email } });
        let userId = existingUser?.id;

        if (!existingUser) {
          const u = await prisma.user.create({
            data: {
              email: r.email,
              firstName: r.fullName.split(" ")[0],
              lastName: r.fullName.split(" ")[1] || "Rider",
              phoneNumber: r.phoneNumber,
              passwordHash: defaultPasswordHash,
              role: "RIDER"
            }
          });
          userId = u.id;
        }

        await prisma.rider.create({
          data: {
            riderId: r.riderId,
            fullName: r.fullName,
            phoneNumber: r.phoneNumber,
            email: r.email,
            passwordHash: defaultPasswordHash,
            address: r.address,
            vehicleType: r.vehicleType,
            vehicleRegistration: r.vehicleRegistration,
            status: r.status,
            notes: r.notes,
            profilePhoto: r.profilePhoto,
            userId
          }
        });
      }
    }

    const ordersCount = await prisma.order.count();
    if (ordersCount === 0) {
      console.log("Seeding sample customer orders...");
      const tundeRider = await prisma.rider.findFirst({ where: { email: "tunde@kayamarket.com" } });
      const emekaRider = await prisma.rider.findFirst({ where: { email: "emeka@kayamarket.com" } });

      await prisma.order.create({
        data: {
          orderNumber: "KM-2026-9812",
          customerName: "Chinedu Okafor",
          customerPhone: "+234 803 123 4567",
          deliveryAddress: "12 Admiralty Way, Lekki Phase 1, Lagos",
          deliveryDate: "2026-07-28",
          deliveryTime: "10:00 AM - 12:00 PM",
          paymentMethod: "Card Payment",
          paymentStatus: "PAID",
          totalAmount: 87500,
          deliveryFee: 2000,
          status: "OUT_FOR_DELIVERY",
          riderId: tundeRider?.id || null,
          items: {
            create: [
              { productName: "Kaya Premium Nigerian Rice (50kg)", price: 78000, quantity: 1 },
              { productName: "Pure Red Palm Oil (5 Litres)", price: 9500, quantity: 1 }
            ]
          },
          timeline: {
            create: [
              { status: "ORDER_PLACED", title: "Order Placed", description: "Customer placed order", updatedBy: "Customer" },
              { status: "ORDER_CONFIRMED", title: "Order Confirmed", description: "Payment verified & order confirmed", updatedBy: "Admin" },
              { status: "PREPARING", title: "Preparing Order", description: "Items packed from store warehouse", updatedBy: "Admin" },
              { status: "ASSIGNED_TO_RIDER", title: "Assigned to Rider", description: "Order assigned to rider Tunde Alao", updatedBy: "Admin" },
              { status: "OUT_FOR_DELIVERY", title: "Out for Delivery", description: "Rider is en route to customer destination", updatedBy: "Rider (Tunde Alao)" }
            ]
          }
        }
      });

      await prisma.order.create({
        data: {
          orderNumber: "KM-2026-4421",
          customerName: "Amara Yusuf",
          customerPhone: "+234 812 445 6677",
          deliveryAddress: "Plot 1043, Garki Area 11, Abuja",
          deliveryDate: "2026-07-29",
          deliveryTime: "02:00 PM - 04:00 PM",
          paymentMethod: "Bank Transfer",
          paymentStatus: "PAID",
          totalAmount: 48500,
          deliveryFee: 2000,
          status: "PREPARING",
          riderId: emekaRider?.id || null,
          items: {
            create: [
              { productName: "Oloyin Honey Beans (25kg)", price: 42000, quantity: 1 },
              { productName: "Abuja Tuber Yam (Large)", price: 6500, quantity: 1 }
            ]
          },
          timeline: {
            create: [
              { status: "ORDER_PLACED", title: "Order Placed", description: "Customer placed order", updatedBy: "Customer" },
              { status: "ORDER_CONFIRMED", title: "Order Confirmed", description: "Payment confirmed via Bank Transfer", updatedBy: "Admin" },
              { status: "PREPARING", title: "Preparing Order", description: "Store staff is sorting items", updatedBy: "Admin" }
            ]
          }
        }
      });
    }
  } catch (error) {
    console.error("Seed helper error:", error);
  }
}
