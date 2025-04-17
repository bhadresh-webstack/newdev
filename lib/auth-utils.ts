import { sign, verify, type Secret, type SignOptions } from "jsonwebtoken"
import { hash, compare } from "bcrypt"
import nodemailer from "nodemailer"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

const JWT_SECRET: Secret = process.env.JWT_SECRET || "your-secret-key"

// Generate JWT token
export function generateToken(payload: any, expiresIn = "7d") {
  return sign(payload, JWT_SECRET, { expiresIn } as SignOptions)
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET) as any
  } catch (error) {
    return null
  }
}

// Hash password
export async function hashPassword(password: string) {
  const saltRounds = 10
  return await hash(password, saltRounds)
}

// Compare password with hash
export async function comparePasswords(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword)
}

// Extract username from email
export function getUsernameFromEmail(email: string) {
  return email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

// Update the sendVerificationEmail function to use Gmail properly
export async function sendVerificationEmail(email: string, token: string) {
  try {
    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail app password
      },
    })

    // Verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password?token=${token}`

    // Email content
    const mailOptions = {
      from: `"Task Management" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email and Set Password",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Task Management!</h2>
        <p>Thank you for signing up. Please click the link below to verify your email and set your password:</p>
        <p>
          <a href="${verificationLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email & Set Password
          </a>
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't sign up for an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The Task Management Team</p>
      </div>
    `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

// Authenticate request middleware
export async function authenticateRequest(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return {
        authenticated: false,
        error: "Authentication required. Please log in.",
        userId: null,
        role: null,
        email: null,
      }
    }

    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return {
        authenticated: false,
        error: "Invalid or expired token. Please log in again.",
        userId: null,
        role: null,
        email: null,
      }
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      return {
        authenticated: false,
        error: "User not found",
        userId: null,
        role: null,
        email: null,
      }
    }

    return {
      authenticated: true,
      error: null,
      userId: user.id,
      role: user.role,
      email: user.email,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return {
      authenticated: false,
      error: "Authentication failed",
      userId: null,
      role: null,
      email: null,
    }
  }
}
