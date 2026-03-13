import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Search customers for autocomplete
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.length < 1) {
      return NextResponse.json({ success: true, data: [] });
    }

    const customers = await prisma.customers.findMany({
      where: {
        fullname: { contains: query },
      },
      take: 10,
      select: {
        id: true,
        fullname: true,
        phone_number: true,
      },
      orderBy: { fullname: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Search customers error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

