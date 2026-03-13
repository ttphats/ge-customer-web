import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Get full prescription data by refKey
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ refKey: string }> }
) {
  try {
    const { refKey } = await params;

    const [prescription, oldPrescription, machinePrescription] = await Promise.all([
      prisma.prescription.findFirst({
        where: { ref_key: refKey },
        include: { customer: true },
      }),
      prisma.old_prescription.findFirst({ where: { ref_key: refKey } }),
      prisma.machine_prescription.findFirst({ where: { ref_key: refKey } }),
    ]);

    if (!prescription) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn thuốc" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { prescription, oldPrescription, machinePrescription },
    });
  } catch (error) {
    console.error("Get prescription error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

// PUT: Update prescription (all 3 types)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ refKey: string }> }
) {
  try {
    const { refKey } = await params;
    const body = await request.json();
    const { prescription, oldPrescription, machinePrescription } = body;

    // Update all in transaction
    await prisma.$transaction([
      prisma.prescription.updateMany({
        where: { ref_key: refKey },
        data: {
          left_sphere: prescription.left_sphere,
          left_cylinder: prescription.left_cylinder,
          left_axis: prescription.left_axis ? parseInt(prescription.left_axis) : null,
          left_lk: prescription.left_lk,
          left_addition: prescription.left_addition,
          left_tl: prescription.left_tl,
          left_pd: prescription.left_pd,
          right_sphere: prescription.right_sphere,
          right_cylinder: prescription.right_cylinder,
          right_axis: prescription.right_axis ? parseInt(prescription.right_axis) : null,
          right_lk: prescription.right_lk,
          right_addition: prescription.right_addition,
          right_tl: prescription.right_tl,
          right_pd: prescription.right_pd,
          description: prescription.description,
          staff_name: prescription.staff_name,
          frame_name: prescription.frame_name,
          frame_price: prescription.frame_price,
          lense_name: prescription.lense_name,
          lense_price: prescription.lense_price,
          re_examinated_date: prescription.re_examinated_date ? new Date(prescription.re_examinated_date) : null,
        },
      }),
      prisma.old_prescription.updateMany({
        where: { ref_key: refKey },
        data: {
          left_sphere: oldPrescription?.left_sphere, left_cylinder: oldPrescription?.left_cylinder,
          left_axis: oldPrescription?.left_axis ? parseInt(oldPrescription.left_axis) : null,
          left_lk: oldPrescription?.left_lk, left_addition: oldPrescription?.left_addition,
          left_tl: oldPrescription?.left_tl, left_pd: oldPrescription?.left_pd,
          right_sphere: oldPrescription?.right_sphere, right_cylinder: oldPrescription?.right_cylinder,
          right_axis: oldPrescription?.right_axis ? parseInt(oldPrescription.right_axis) : null,
          right_lk: oldPrescription?.right_lk, right_addition: oldPrescription?.right_addition,
          right_tl: oldPrescription?.right_tl, right_pd: oldPrescription?.right_pd,
        },
      }),
      prisma.machine_prescription.updateMany({
        where: { ref_key: refKey },
        data: {
          left_sphere: machinePrescription?.left_sphere, left_cylinder: machinePrescription?.left_cylinder,
          left_axis: machinePrescription?.left_axis ? parseInt(machinePrescription.left_axis) : null,
          left_lk: machinePrescription?.left_lk, left_addition: machinePrescription?.left_addition,
          left_tl: machinePrescription?.left_tl, left_pd: machinePrescription?.left_pd,
          right_sphere: machinePrescription?.right_sphere, right_cylinder: machinePrescription?.right_cylinder,
          right_axis: machinePrescription?.right_axis ? parseInt(machinePrescription.right_axis) : null,
          right_lk: machinePrescription?.right_lk, right_addition: machinePrescription?.right_addition,
          right_tl: machinePrescription?.right_tl, right_pd: machinePrescription?.right_pd,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Update prescription error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

// DELETE: Delete prescription (all 3 types)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ refKey: string }> }
) {
  try {
    const { refKey } = await params;

    await prisma.$transaction([
      prisma.prescription.deleteMany({ where: { ref_key: refKey } }),
      prisma.old_prescription.deleteMany({ where: { ref_key: refKey } }),
      prisma.machine_prescription.deleteMany({ where: { ref_key: refKey } }),
    ]);

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    console.error("Delete prescription error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

