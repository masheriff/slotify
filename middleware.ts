// middleware.ts (in your project root)
import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get session using Better Auth's helper
  const session = await getSessionCookie(request)
  
  if (pathname === '/') {
    if (!session) {
      // User is not logged in, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    } else {
      // User is logged in, redirect to admin
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  // If user is logged in and trying to access login page, redirect to admin
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // For all other paths, continue normally
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}