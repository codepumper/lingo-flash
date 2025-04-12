import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          const response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          const response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  // Refresh session if expired
  const { data } = await supabase.auth.getSession()

  // If no session and trying to access protected route, redirect to login
  if (!data.session && isProtectedRoute(request.nextUrl.pathname)) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If session and trying to access auth route, redirect to dashboard
  if (data.session && isAuthRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Define which routes are protected (require authentication)
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/dashboard", "/flashcards", "/practice"]
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

// Define which routes are for authentication (login/register)
function isAuthRoute(pathname: string): boolean {
  const authRoutes = ["/login", "/register"]
  return authRoutes.includes(pathname)
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
