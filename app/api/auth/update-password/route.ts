import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    // ✅ Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      console.log("decoded",decoded)
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // ✅ Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update the password in the database
    await prisma.user.update({
      where: { email: decoded.email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: "Password has been reset successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Error in reset password:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
