import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ✅ Define validation schema using `zod`
const signupSchema = z.object({
  user_name: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "admin", "team_member"]).default("customer"),
  profile_image: z.string().url().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate input fields using `zod`
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map((err) => err.message).join(", ") },
        { status: 400 }
      );
    }

    const { user_name, email, password, role, profile_image } = validation.data;

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email is already in use" }, { status: 400 });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create a new user in the database
    const newUser = await prisma.user.create({
      data: { user_name, email, password: hashedPassword, role, profile_image },
    });

    // ✅ Generate a JWT-based password reset link (valid for 1 hour)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

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
      subject: "Welcome!",
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

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: "User created and password setup email sent!", user: newUser }, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
