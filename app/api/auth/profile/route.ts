import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Ensure using env variable

export async function GET(req: Request) {
  try {
    // ✅ Extract token from cookies
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ error: "Unauthorized: No token found" }, { status: 401 });
    }

    // ✅ Parse the cookies
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => c.split("="))
    );
    const token = cookies.auth_token; // Extract auth_token

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
