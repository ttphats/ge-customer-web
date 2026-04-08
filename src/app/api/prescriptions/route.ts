import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper function to generate refKey matching WPF logic
// Format: YYYYMMDD + count (e.g., "202601081", "202601082", etc.)
async function generateRefKey(customerId: number): Promise<string> {
  const now = new Date();

  // Format date as YYYYMMDD (matching WPF: dateNow.Replace("/", ""))
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;

  // Get start and end of today
  const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Count existing old_prescriptions for this customer today (matching WPF logic)
  const existingCount = await prisma.old_prescription.count({
    where: {
      customer_id: customerId,
      examined_date: {
        gte: startOfDay,
        lte: endOfDay,
      }
    }
  });

  // refKey = dateString + (count + 1)
  const refKey = `${dateString}${existingCount + 1}`;

  return refKey;
}

// POST: Create new prescription (all 3 types)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, prescription, oldPrescription, machinePrescription } = body;

    // Debug log to check what data is being received
    console.log("=== CREATE PRESCRIPTION DEBUG ===");
    console.log("Customer ID:", customerId);
    console.log("Old Prescription data:", JSON.stringify(oldPrescription, null, 2));
    console.log("=================================");

    if (!customerId || !prescription) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Generate refKey matching WPF format: YYYYMMDD + count
    const refKey = await generateRefKey(customerId);
    const examinedDate = new Date();

    console.log("Generated refKey:", refKey);

    // Create all 3 prescriptions in a transaction
    await prisma.$transaction([
      // Main prescription
      prisma.prescription.create({
        data: {
          examined_date: examinedDate,
          customer_id: customerId,
          ref_key: refKey,
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
      // Old prescription
      prisma.old_prescription.create({
        data: {
          examined_date: examinedDate,
          customer_id: customerId,
          ref_key: refKey,
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
      // Machine prescription
      prisma.machine_prescription.create({
        data: {
          examined_date: examinedDate,
          customer_id: customerId,
          ref_key: refKey,
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

    return NextResponse.json({
      success: true,
      message: "Tạo đơn thuốc thành công",
      data: { refKey },
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra" },
      { status: 500 }
    );
  }
}

