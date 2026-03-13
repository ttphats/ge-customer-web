import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Get all prescriptions for a customer (sorted by examined_date desc)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, message: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    // Get all prescriptions for this customer, sorted by examined_date descending
    // This matches the WPF logic in NewCustomerPrescriptionWindow.xaml.cs Load_Data()
    const prescriptions = await prisma.prescription.findMany({
      where: { customer_id: customerId },
      orderBy: { examined_date: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error("Get customer prescriptions error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

