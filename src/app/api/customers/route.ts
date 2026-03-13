import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: List customers with pagination, search and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "5");
    const fullname = searchParams.get("fullname") || "";
    const phone = searchParams.get("phone") || "";
    const minPrescriptions = searchParams.get("minPrescriptions") || "";
    const gender = searchParams.get("gender") || "";
    const hasFamily = searchParams.get("hasFamily") || "";

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (fullname) {
      where.fullname = { contains: fullname };
    }
    if (phone) {
      where.phone_number = { contains: phone };
    }
    if (gender !== "") {
      where.gender = parseInt(gender);
    }

    // Filter by family members (check family_members table)
    if (hasFamily === "true") {
      where.family_members = { some: {} };
    } else if (hasFamily === "false") {
      where.family_members = { none: {} };
    }

    // If filtering by prescription count
    if (minPrescriptions) {
      const minCount = parseInt(minPrescriptions);

      // Get customer IDs with prescription count >= minCount
      const customersWithPrescriptions = await prisma.prescription.groupBy({
        by: ['customer_id'],
        _count: { id: true },
      });

      // Filter by count >= minCount
      const customerIds = customersWithPrescriptions
        .filter(c => c._count.id >= minCount)
        .map(c => c.customer_id)
        .filter((id): id is number => id !== null);

      // Add to where clause - if no customers match, return empty
      if (customerIds.length === 0) {
        where.id = { in: [-1] }; // No match
      } else {
        where.id = { in: customerIds };
      }
    }

    // Get customers
    const [customers, total] = await Promise.all([
      prisma.customers.findMany({
        where,
        orderBy: { id: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          fullname: true,
          dateofbirth: true,
          phone_number: true,
          address: true,
          gender: true,
          created_date: true,
          family_key: true,
        },
      }),
      prisma.customers.count({ where }),
    ]);

    // Get prescription counts for these customers
    const customerIds = customers.map(c => c.id);
    const prescriptionCounts = await prisma.prescription.groupBy({
      by: ['customer_id'],
      where: { customer_id: { in: customerIds } },
      _count: { id: true },
    });

    // Create a map of customer_id -> count
    const countMap = new Map<number, number>();
    prescriptionCounts.forEach(p => {
      if (p.customer_id !== null) {
        countMap.set(p.customer_id, p._count.id);
      }
    });

    // Transform to include prescription_count
    const items = customers.map(c => ({
      ...c,
      prescription_count: countMap.get(c.id) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

// POST: Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullname, dateofbirth, phone_number, address, gender } = body;

    if (!fullname || !dateofbirth || !phone_number) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc" },
        { status: 400 }
      );
    }

    const customer = await prisma.customers.create({
      data: {
        fullname,
        dateofbirth: new Date(dateofbirth),
        phone_number,
        address: address || null,
        gender: gender !== undefined ? gender : null,
        created_date: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo khách hàng thành công",
      data: customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

