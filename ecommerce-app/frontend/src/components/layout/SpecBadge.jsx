/**
 * SpecBadge
 *
 * The one repeating structural device across the whole site — an
 * engraved-plate-style badge for real measurements (e.g. "42mm · 100m").
 * Real watch case-backs are genuinely stamped this way, so this isn't a
 * decorative flourish, it's the visual grammar the whole product grid is
 * built around. Always rendered in font-mono, since every real measurement
 * uses that face consistently — see tailwind.config.js's fontFamily comment.
 */
function SpecBadge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border border-brass-400/40 bg-ink-950/80 px-2 py-1 font-mono text-xs tracking-tight text-brass-400 ${className}`}
    >
      {children}
    </span>
  );
}

export default SpecBadge;