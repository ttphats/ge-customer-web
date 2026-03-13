import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Get customer by ID with prescriptions and family
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
      include: {
        prescriptions: {
          orderBy: { examined_date: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    // Get family members (same family_key or same phone_number)
    let familyMembers: Awaited<ReturnType<typeof prisma.customers.findMany>> = [];
    if (customer.family_key) {
      familyMembers = await prisma.customers.findMany({
        where: {
          family_key: customer.family_key,
          id: { not: customerId },
        },
      });
    } else if (customer.phone_number) {
      familyMembers = await prisma.customers.findMany({
        where: {
          phone_number: customer.phone_number,
          id: { not: customerId },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        familyMembers,
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

// PUT: Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);
    const body = await request.json();

    const customer = await prisma.customers.update({
      where: { id: customerId },
      data: {
        fullname: body.fullname,
        dateofbirth: body.dateofbirth ? new Date(body.dateofbirth) : undefined,
        phone_number: body.phone_number,
        address: body.address,
        gender: body.gender,
        family_key: body.family_key,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật thành công",
      data: customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

// DELETE: Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    await prisma.customers.delete({
      where: { id: customerId },
    });

    return NextResponse.json({
      success: true,
      message: "Xóa khách hàng thành công",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

