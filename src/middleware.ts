import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get access token from cookie or localStorage (will only have cookies in request)
  const token = request.cookies.get("access_token");

  // Check if the request is for a protected route (dashboard)
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  // If trying to access dashboard without a token
  if (isDashboardRoute && !token) {
    // Redirect to login page with a return URL
    const url = new URL("/login", request.url);
    url.searchParams.set("returnUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If already logged in and trying to access login page
  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
