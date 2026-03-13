import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Get full prescription data by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prescriptionId = parseInt(id);

    // First get the prescription by ID
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { customer: true },
    });

    if (!prescription) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn thuốc" },
        { status: 404 }
      );
    }

    // Then get old and machine prescriptions by ref_key
    let [oldPrescription, machinePrescription] = await Promise.all([
      prisma.old_prescription.findFirst({ where: { ref_key: prescription.ref_key } }),
      prisma.machine_prescription.findFirst({ where: { ref_key: prescription.ref_key } }),
    ]);

    // Check if oldPrescription is empty (no meaningful data)
    const isOldPrescriptionEmpty = !oldPrescription ||
      (!oldPrescription.right_sphere && !oldPrescription.left_sphere &&
       !oldPrescription.right_cylinder && !oldPrescription.left_cylinder &&
       !oldPrescription.right_lk && !oldPrescription.left_lk);

    // If empty, fetch previous prescription from prescription table
    if (isOldPrescriptionEmpty && prescription.customer_id && prescription.examined_date) {
      const previousPrescription = await prisma.prescription.findFirst({
        where: {
          customer_id: prescription.customer_id,
          examined_date: { lt: prescription.examined_date },
        },
        orderBy: { examined_date: 'desc' },
      });

      if (previousPrescription) {
        // Map prescription fields to old_prescription format
        oldPrescription = {
          id: 0, // Virtual ID
          examined_date: previousPrescription.examined_date,
          customer_id: previousPrescription.customer_id,
          ref_key: previousPrescription.ref_key,
          right_lk: previousPrescription.right_lk,
          right_sphere: previousPrescription.right_sphere,
          right_cylinder: previousPrescription.right_cylinder,
          right_axis: previousPrescription.right_axis,
          right_addition: previousPrescription.right_addition,
          right_tl: previousPrescription.right_tl,
          right_pd: previousPrescription.right_pd,
          left_lk: previousPrescription.left_lk,
          left_sphere: previousPrescription.left_sphere,
          left_cylinder: previousPrescription.left_cylinder,
          left_axis: previousPrescription.left_axis,
          left_addition: previousPrescription.left_addition,
          left_tl: previousPrescription.left_tl,
          left_pd: previousPrescription.left_pd,
          description: previousPrescription.description,
          staff_name: previousPrescription.staff_name,
        };
      }
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

// PUT: Update prescription (all 3 types) by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prescriptionId = parseInt(id);
    const body = await request.json();
    const { prescription: prescData, oldPrescription, machinePrescription } = body;

    // Get the prescription to find ref_key
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!existingPrescription) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn thuốc" },
        { status: 404 }
      );
    }

    const refKey = existingPrescription.ref_key;

    // Update all in transaction
    await prisma.$transaction([
      prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
          left_sphere: prescData.left_sphere,
          left_cylinder: prescData.left_cylinder,
          left_axis: prescData.left_axis ? parseInt(prescData.left_axis) : null,
          left_lk: prescData.left_lk,
          left_addition: prescData.left_addition,
          left_tl: prescData.left_tl,
          left_pd: prescData.left_pd,
          right_sphere: prescData.right_sphere,
          right_cylinder: prescData.right_cylinder,
          right_axis: prescData.right_axis ? parseInt(prescData.right_axis) : null,
          right_lk: prescData.right_lk,
          right_addition: prescData.right_addition,
          right_tl: prescData.right_tl,
          right_pd: prescData.right_pd,
          description: prescData.description,
          staff_name: prescData.staff_name,
          frame_name: prescData.frame_name,
          frame_price: prescData.frame_price,
          lense_name: prescData.lense_name,
          lense_price: prescData.lense_price,
          re_examinated_date: prescData.re_examinated_date ? new Date(prescData.re_examinated_date) : null,
        },
      }),
      prisma.old_prescription.updateMany({
        where: { ref_key: refKey },
        data: {
          left_sphere: oldPrescription?.left_sphere,
          left_cylinder: oldPrescription?.left_cylinder,
          left_axis: oldPrescription?.left_axis ? parseInt(oldPrescription.left_axis) : null,
          left_lk: oldPrescription?.left_lk,
          left_addition: oldPrescription?.left_addition,
          left_tl: oldPrescription?.left_tl,
          left_pd: oldPrescription?.left_pd,
          right_sphere: oldPrescription?.right_sphere,
          right_cylinder: oldPrescription?.right_cylinder,
          right_axis: oldPrescription?.right_axis ? parseInt(oldPrescription.right_axis) : null,
          right_lk: oldPrescription?.right_lk,
          right_addition: oldPrescription?.right_addition,
          right_tl: oldPrescription?.right_tl,
          right_pd: oldPrescription?.right_pd,
        },
      }),
      prisma.machine_prescription.updateMany({
        where: { ref_key: refKey },
        data: {
          left_sphere: machinePrescription?.left_sphere,
          left_cylinder: machinePrescription?.left_cylinder,
          left_axis: machinePrescription?.left_axis ? parseInt(machinePrescription.left_axis) : null,
          left_lk: machinePrescription?.left_lk,
          left_addition: machinePrescription?.left_addition,
          left_tl: machinePrescription?.left_tl,
          left_pd: machinePrescription?.left_pd,
          right_sphere: machinePrescription?.right_sphere,
          right_cylinder: machinePrescription?.right_cylinder,
          right_axis: machinePrescription?.right_axis ? parseInt(machinePrescription.right_axis) : null,
          right_lk: machinePrescription?.right_lk,
          right_addition: machinePrescription?.right_addition,
          right_tl: machinePrescription?.right_tl,
          right_pd: machinePrescription?.right_pd,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Update prescription error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

// DELETE: Delete prescription (all 3 types) by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prescriptionId = parseInt(id);

    // Get the prescription to find ref_key
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!existingPrescription) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn thuốc" },
        { status: 404 }
      );
    }

    const refKey = existingPrescription.ref_key;

    await prisma.$transaction([
      prisma.prescription.delete({ where: { id: prescriptionId } }),
      prisma.old_prescription.deleteMany({ where: { ref_key: refKey } }),
      prisma.machine_prescription.deleteMany({ where: { ref_key: refKey } }),
    ]);

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    console.error("Delete prescription error:", error);
    return NextResponse.json({ success: false, message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

