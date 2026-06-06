/**
 * Coin — the spinning XLM coin (teal disc + Stellar asterisk).
 * Pure presentational, safe to render on the server.
 */
export function Coin({ scale = 1, className = '' }: { scale?: number; className?: string }) {
  return (
    <span
      className={`xlm-coin ${className}`}
      style={scale !== 1 ? { transform: `scale(${scale})` } : undefined}
    >
      <span className="disc">
        <span className="ast">✻</span>
      </span>
    </span>
  )
}
