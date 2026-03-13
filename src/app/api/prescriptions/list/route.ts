import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Get all prescriptions with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // Search params
    const customerName = searchParams.get("customerName") || "";
    const phoneNumber = searchParams.get("phoneNumber") || "";
    const refKey = searchParams.get("refKey") || "";
    const staffName = searchParams.get("staffName") || "";

    // Date filters
    const examinedDateFrom = searchParams.get("examinedDateFrom");
    const examinedDateTo = searchParams.get("examinedDateTo");
    const reExaminatedDateFrom = searchParams.get("reExaminatedDateFrom");
    const reExaminatedDateTo = searchParams.get("reExaminatedDateTo");

    // Build where clause
    const where: any = {};

    if (customerName) {
      where.customer = {
        fullname: { contains: customerName },
      };
    }

    if (phoneNumber) {
      where.customer = {
        ...where.customer,
        phone_number: { contains: phoneNumber },
      };
    }

    if (refKey) {
      where.ref_key = { contains: refKey };
    }

    if (staffName) {
      where.staff_name = { contains: staffName };
    }

    if (examinedDateFrom || examinedDateTo) {
      where.examined_date = {};
      if (examinedDateFrom) {
        where.examined_date.gte = new Date(examinedDateFrom);
      }
      if (examinedDateTo) {
        where.examined_date.lte = new Date(examinedDateTo);
      }
    }

    if (reExaminatedDateFrom || reExaminatedDateTo) {
      where.re_examinated_date = {};
      if (reExaminatedDateFrom) {
        where.re_examinated_date.gte = new Date(reExaminatedDateFrom);
      }
      if (reExaminatedDateTo) {
        where.re_examinated_date.lte = new Date(reExaminatedDateTo);
      }
    }

    // Get total count
    const total = await prisma.prescription.count({ where });

    // Get prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { id: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            fullname: true,
            phone_number: true,
            dateofbirth: true,
            gender: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        items: prescriptions,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get prescriptions list error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

