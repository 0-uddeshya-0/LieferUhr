export function BrandMark({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="FrachtRadar">
      <rect width="64" height="64" rx="14" fill="#ea580c" />
      <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 24h26v20H10z" />
        <path d="M36 30h7l7 7v7H36z" />
        <circle cx="18" cy="47" r="4" />
        <circle cx="43" cy="47" r="4" />
        <path d="M42 10a14 14 0 0 1 14 14" opacity="0.45" />
        <path d="M42 17a7 7 0 0 1 7 7" opacity="0.7" />
      </g>
      <circle cx="42" cy="24" r="2.5" fill="#fff" />
    </svg>
  );
}
