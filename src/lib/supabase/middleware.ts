import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { hasPermission } from '../permissions'

export async function updateSession(request: NextRequest) {
  // Intercept Supabase email confirmations that incorrectly land on the root URL
  if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('code')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/auth',
    '/forgot-password',
    '/about',
    '/careers',
    '/contact',
    '/legal'
  ];

  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`)
  );

  if (!user && !isPublicPath) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // RBAC Check
  if (user && request.nextUrl.pathname.startsWith('/')) {
    const role = user.user_metadata?.role || 'Administrateur';
    
    // Skip RBAC check for public paths
    if (!isPublicPath) {
      if (!hasPermission(role, request.nextUrl.pathname)) {
        // Prevent infinite redirect loop
        if (request.nextUrl.pathname !== '/dashboard') {
          // Redirect unauthorized users to dashboard
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse
}
