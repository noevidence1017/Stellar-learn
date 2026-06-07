'use client'

import { SignedIn, SignedOut } from '@clerk/nextjs'
import { clerkEnabled } from '@/lib/auth'

/**
 * Auth-aware wrappers that work whether or not Clerk is configured.
 *
 * When Clerk is enabled they delegate to <SignedIn> / <SignedOut>. When it's
 * disabled (no keys) the app is treated as logged-out: GuestOnly renders its
 * children and AuthedOnly renders nothing — so pages relying on these never
 * crash for want of a ClerkProvider.
 */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  if (!clerkEnabled) return <>{children}</>
  return <SignedOut>{children}</SignedOut>
}

export function AuthedOnly({ children }: { children: React.ReactNode }) {
  if (!clerkEnabled) return null
  return <SignedIn>{children}</SignedIn>
}
