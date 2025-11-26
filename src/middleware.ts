import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Protect all dashboard routes
  if (isProtectedRoute(req)) {
    await auth.protect();

    // Check if user has selected a role (Phase 2 - optional check)
    // For now, we'll allow access if authenticated
    // Role-specific route protection can be added in future phases
  }

  // Allow onboarding routes only for authenticated users
  if (isOnboardingRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};