'use client'

import { useMemo } from 'react'

interface Star {
  left: number
  top: number
  big: boolean
  color: '' | 'gold' | 'teal'
  dur: number
  del: number
}

interface Drifter {
  left: number
  top: number
  dur: number
  del: number
}

/**
 * StarField — the shared cosmic backdrop: twinkling pixel stars plus a few
 * gold particles drifting upward. Recreated from the prototype's stars() IIFE.
 * Rendered once on mount; positions are stable across re-renders.
 */
export function StarField({ count = 90, drifters = 14 }: { count?: number; drifters?: number }) {
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: count }, () => {
        const colorRoll = Math.random()
        return {
          left: Math.random() * 1280,
          top: Math.random() * 720,
          big: Math.random() > 0.8,
          color: colorRoll > 0.82 ? (Math.random() > 0.5 ? 'gold' : 'teal') : '',
          dur: 1.5 + Math.random() * 3,
          del: Math.random() * 3,
        }
      }),
    [count]
  )

  const drift = useMemo<Drifter[]>(
    () =>
      Array.from({ length: drifters }, () => ({
        left: Math.random() * 1280,
        top: 720 + Math.random() * 200,
        dur: 8 + Math.random() * 7,
        del: Math.random() * 8,
      })),
    [drifters]
  )

  const colorHex = (c: Star['color']) =>
    c === 'gold' ? '#ffd700' : c === 'teal' ? '#00bcd4' : '#fff'

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {/* nebula glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(700px 520px at 22% 18%, rgba(123,94,167,.28), transparent 70%),' +
            'radial-gradient(620px 460px at 80% 30%, rgba(61,90,254,.20), transparent 70%),' +
            'radial-gradient(520px 420px at 60% 95%, rgba(0,188,212,.14), transparent 70%)',
        }}
      />
      {stars.map((s, i) => (
        <span
          key={`s${i}`}
          className="absolute animate-twinkle"
          style={{
            left: `${(s.left / 1280) * 100}%`,
            top: `${(s.top / 720) * 100}%`,
            width: s.big ? 3 : 2,
            height: s.big ? 3 : 2,
            background: colorHex(s.color),
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.del}s`,
          }}
        />
      ))}
      {drift.map((d, i) => (
        <span
          key={`d${i}`}
          className="absolute animate-drift"
          style={{
            left: `${(d.left / 1280) * 100}%`,
            top: `${(d.top / 720) * 100}%`,
            width: 3,
            height: 3,
            opacity: 0.5,
            background: '#ffd700',
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.del}s`,
          }}
        />
      ))}
    </div>
  )
}
