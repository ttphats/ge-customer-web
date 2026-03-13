import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST: Add family member by linking FamilyKey
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);
    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin thành viên" },
        { status: 400 }
      );
    }

    // Get current customer
    const customer = await prisma.customers.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    // Generate or use existing FamilyKey
    let familyKey = customer.family_key;
    if (!familyKey) {
      familyKey = `FAMILY000${customerId}`;
      // Update current customer with FamilyKey
      await prisma.customers.update({
        where: { id: customerId },
        data: { family_key: familyKey },
      });
    }

    // Link the new family member with same FamilyKey
    await prisma.customers.update({
      where: { id: parseInt(memberId) },
      data: { family_key: familyKey },
    });

    return NextResponse.json({
      success: true,
      message: "Đã thêm thành viên gia đình",
    });
  } catch (error) {
    console.error("Add family member error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

// DELETE: Remove family member (unlink FamilyKey)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin thành viên" },
        { status: 400 }
      );
    }

    // Remove FamilyKey from the member
    await prisma.customers.update({
      where: { id: parseInt(memberId) },
      data: { family_key: null },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa thành viên khỏi gia đình",
    });
  } catch (error) {
    console.error("Remove family member error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

