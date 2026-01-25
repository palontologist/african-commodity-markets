import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/watchlist(.*)',
  '/profile(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isFarmerRoute = createRouteMatcher(['/farmer(.*)']);
const isTraderRoute = createRouteMatcher(['/trader(.*)']);
const isCooperativeRoute = createRouteMatcher(['/cooperative(.*)']);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding',
  '/api/webhooks',
]);

export default clerkMiddleware(async (auth, req) => {
  const session = await auth();
  const role = session.sessionClaims?.metadata?.role;
  const { pathname } = req.nextUrl;

  // Handle onboarding flow for authenticated users
  if (session && !isPublicRoute(req)) {
    // Check if user has completed onboarding
    // This would typically come from your database
    const onboardingCompleted = req.cookies.get('onboarding_completed')
    
    if (!onboardingCompleted && pathname !== "/onboarding") {
      // Redirect to onboarding
      const onboardingUrl = new URL("/onboarding", req.url)
      return NextResponse.redirect(onboardingUrl)
    }
  }

  // Protect admin routes - only admins can access
  if (isAdminRoute(req) && role !== 'admin') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  // Protect farmer routes - farmers and admins can access
  if (isFarmerRoute(req) && role !== 'farmer' && role !== 'admin') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  // Protect trader routes - traders and admins can access
  if (isTraderRoute(req) && role !== 'trader' && role !== 'admin') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  // Protect cooperative routes - cooperatives and admins can access
  if (isCooperativeRoute(req) && role !== 'cooperative' && role !== 'admin') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  // Protect generic routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};