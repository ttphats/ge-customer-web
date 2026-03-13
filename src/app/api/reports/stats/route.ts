import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Get statistics for reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build date filter
    const dateFilter: any = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo);
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Get this month's date range
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Total counts
    const totalCustomers = await prisma.customers.count();
    const totalPrescriptions = await prisma.prescription.count();

    // Today's stats
    const prescriptionsToday = await prisma.prescription.count({
      where: {
        examined_date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const customersToday = await prisma.customers.count({
      where: {
        created_date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // This week's stats
    const prescriptionsThisWeek = await prisma.prescription.count({
      where: {
        examined_date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    const customersThisWeek = await prisma.customers.count({
      where: {
        created_date: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    // This month's stats
    const prescriptionsThisMonth = await prisma.prescription.count({
      where: {
        examined_date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const customersThisMonth = await prisma.customers.count({
      where: {
        created_date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    // Top customers with most prescriptions
    const topCustomers = await prisma.customers.findMany({
      take: 10,
      orderBy: {
        prescriptions: {
          _count: "desc",
        },
      },
      include: {
        _count: {
          select: { prescriptions: true },
        },
      },
    });

    // Prescriptions by date (last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const prescriptionsByDate = await prisma.prescription.groupBy({
      by: ["examined_date"],
      where: {
        examined_date: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    // Process prescriptions by date for chart
    const prescriptionTrend = prescriptionsByDate.reduce((acc: any, item) => {
      const date = new Date(item.examined_date).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += item._count;
      return acc;
    }, {});

    // Convert to array format for charts
    const trendData = Object.entries(prescriptionTrend).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalPrescriptions,
          prescriptionsToday,
          customersToday,
          prescriptionsThisWeek,
          customersThisWeek,
          prescriptionsThisMonth,
          customersThisMonth,
        },
        topCustomers: topCustomers.map((c) => ({
          id: c.id,
          fullname: c.fullname,
          phone_number: c.phone_number,
          prescriptionCount: c._count.prescriptions,
        })),
        prescriptionTrend: trendData,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

