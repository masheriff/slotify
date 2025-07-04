// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const session = await getSessionCookie(request)
  // console.log('Session:', session)
  // console.log('Pathname:', pathname)
  
  // Handle root path
  if (pathname === '/') {
    return session 
      ? NextResponse.redirect(new URL('/dashboard', request.url))
      : NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If user is logged in and trying to access login, redirect to dashboard
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Allow public routes (auth API, login page, and static assets)
  if (
    pathname.startsWith('/api/auth') || 
    pathname === '/login' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // This catches files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next()
  }
  
  // Everything else requires authentication
  if (!session) {
    // console.log(`Blocking access to protected route: ${pathname}`)
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // ===== NAVIGATION STATE ENHANCEMENT =====
  // Add pathname to headers so it's available in server components
  // This enables server-side navigation state calculation
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  
  // Also add the original URL for debugging/logging purposes
  requestHeaders.set('x-url', request.url)
  
  // Add user agent for mobile detection if needed
  const userAgent = request.headers.get('user-agent') || ''
  requestHeaders.set('x-user-agent', userAgent)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - but we want to allow /api/auth
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - other static assets
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}