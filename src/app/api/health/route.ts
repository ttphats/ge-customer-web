import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const customerCount = await prisma.customers.count();
    const prescriptionCount = await prisma.prescription.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      data: {
        customers: customerCount,
        prescriptions: prescriptionCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

