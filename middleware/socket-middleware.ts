import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth-utils"

export async function middleware(req: NextRequest) {
  // Only apply to socket routes
  if (!req.url.includes("/api/socket")) {
    return NextResponse.next()
  }

  // Authenticate the request
  const auth = await authenticateRequest(req)

  if (!auth.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/socket/:path*"],
}
