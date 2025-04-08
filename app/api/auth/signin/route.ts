import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma/client";


const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Use env variable

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // ✅ Check if email and password are provided
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // ✅ Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // ✅ Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d", // Token expires in 7 days
    });

    // ✅ Create HTTP-only Secure Cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role },
    });

    response.headers.append(
      "Set-Cookie",
      `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800` // 7 days
    );


    return response;

  } catch (error) {
    console.error("Error during sign-in:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
