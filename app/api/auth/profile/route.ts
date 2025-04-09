import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma/client";
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Ensure using env variable

export async function GET(req: Request) {
  try {
    // ✅ Extract token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    // ✅ Verify JWT Token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    // ✅ Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, user_name: true, email: true, role: true, profile_image: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
