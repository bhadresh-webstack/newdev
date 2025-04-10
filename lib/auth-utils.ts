import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"
const secretKey = new TextEncoder().encode(JWT_SECRET)

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

    const { payload } = await jwtVerify(token, secretKey)

    return {
      authenticated: true,
      error: null,
      userId: payload.userId as string,
      role: payload.role as string,
      email: (payload.email as string) || null,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return {
      authenticated: false,
      error: "Invalid or expired token. Please log in again.",
      userId: null,
      role: null,
      email: null,
    }
  }
}
