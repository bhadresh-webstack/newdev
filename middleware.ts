import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers"; // ✅ Use Edge-compatible cookies API

export function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // ✅ Check if token is in query params for reset password page
  if (nextUrl.pathname.startsWith("/reset-password")) {
    const searchParams = new URLSearchParams(nextUrl.search);
    if (!searchParams.has("token")) {
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }
    return NextResponse.next();
  }

  if (nextUrl.pathname.startsWith("/signup")) {
    const searchParams = new URLSearchParams(nextUrl.search);
    if (!searchParams.has("plan")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // ✅ Protected routes (`/app/*`): Check if auth_token exists in cookies
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Since Edge Runtime does not support `jsonwebtoken`, we just check if token exists
  return NextResponse.next();
}

// ✅ Apply middleware to protect `/app/*` and `/reset-password`
export const config = {
  matcher: ["/app/:path*", "/reset-password","/signup"],
};
