import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {

  const { nextUrl } = req;

  // ✅ Get auth token from cookies
  const token = req.cookies.get("auth_token")?.value;

  // ✅ Redirect authenticated users away from public pages
  if (token && ["/login", "/", "/signup"].includes(nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // ✅ Check if reset password token exists in query params
  if (nextUrl.pathname.startsWith("/reset-password")) {
    const searchParams = new URLSearchParams(nextUrl.search);
    if (!searchParams.has("token")) {
      return NextResponse.redirect(new URL("/forgot-password", req.url));
    }
    return NextResponse.next();
  }

  // ✅ Require `plan` parameter for `/signup`
  if (nextUrl.pathname.startsWith("/signup")) {
    const searchParams = new URLSearchParams(nextUrl.search);
    if (!searchParams.has("plan")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // ✅ Protect `/app/*` routes: Redirect to `/login` if no token
  if (nextUrl.pathname.startsWith("/app") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// ✅ Apply middleware to relevant routes
export const config = {
  matcher: ["/", "/login", "/signup", "/app/:path*", "/reset-password"],
};
