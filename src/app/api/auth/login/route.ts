import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    console.log('[Login API] Starting login request');
    const { username, password } = await request.json();
    console.log('[Login API] Username:', username);

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Query user from database
    console.log('[Login API] Querying database...');
    const user = await prisma.users.findFirst({
      where: {
        username: username,
        password: password,
        status: true,
      },
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
      },
    });

    console.log('[Login API] User found:', user ? 'Yes' : 'No');

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Tên đăng nhập hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Create simple session token
    const sessionData = {
      userId: user.id,
      username: user.username,
      role: user.role,
      loginTime: new Date().toISOString(),
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Có lỗi xảy ra, vui lòng thử lại",
        error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        debug: errorMessage // Tạm thời để debug
      },
      { status: 500 }
    );
  }
}

