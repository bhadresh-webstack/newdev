import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "@/lib/prisma";


// ✅ **GET: Fetch All Users**
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// ✅ **POST: Create a New User and Send Welcome Email with Reset Link**
export async function POST(req: Request) {
  try {
    const { user_name, email, password, role, profile_image } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // ✅ Create a new user in the database
    const newUser = await prisma.user.create({
      data: { user_name, email, password, role, profile_image },
    });

    // ✅ Generate a JWT-based password reset link (valid for 1 hour)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    const resetLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password?token=${resetToken}`;

    // ✅ Send Welcome Email with Reset Link
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
      subject: "Welcome! Set Your Password",
      html: `
        <h1>Hello ${user_name},</h1>
        <p>Welcome to our platform! Please set your password by clicking the link below:</p>
        <a href="${resetLink}" target="_blank" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Set Your Password</a>
        <p>This link is valid for 1 hour.</p>
        <p>If you did not request this, ignore this email.</p>
        <br />
        <p>Best regards,</p>
        <p>The Team</p>
      `,
    };

    // ✅ Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: "User created and password setup email sent!", user: newUser }, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
