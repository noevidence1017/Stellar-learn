import { clerkMiddleware } from '@clerk/nextjs/server'

/**
 * Clerk middleware — required for `auth()` / `<SignedIn>` / `<SignedOut>` and
 * server-side user lookups to work. Without it, any route that reads auth
 * state throws at request time.
 */
export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
