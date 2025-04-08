import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Use a secure secret key

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // ✅ Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Generate a password reset token (valid for 1 hour)
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    // ✅ Send the reset email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Reset Your Password</a>
        <p>This link is valid for 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br />
        <p>Best regards,</p>
        <p>The Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: "Password reset email sent!" }, { status: 200 });

  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
  }
}
