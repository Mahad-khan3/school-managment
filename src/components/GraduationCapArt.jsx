import { useId } from 'react'

export default function GraduationCapArt({ className = '' }) {
  const raw = useId()
  const uid = raw.replace(/:/g, '')

  const board = `board-${uid}`
  const boardLight = `boardLight-${uid}`
  const base = `base-${uid}`
  const bookPurple = `bookPurple-${uid}`
  const bookBlue = `bookBlue-${uid}`
  const bookAmber = `bookAmber-${uid}`
  const glow = `glow-${uid}`

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={board} x1="30" y1="54" x2="170" y2="122" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4B5FD" />
          <stop offset="0.45" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id={boardLight} x1="100" y1="54" x2="150" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={base} x1="70" y1="98" x2="130" y2="132" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D28D9" />
          <stop offset="1" stopColor="#2E1A87" />
        </linearGradient>
        <linearGradient id={bookPurple} x1="42" y1="150" x2="158" y2="170" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9A8D4" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id={bookBlue} x1="50" y1="132" x2="150" y2="152" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93C5FD" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id={bookAmber} x1="58" y1="114" x2="142" y2="134" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <radialGradient id={glow} cx="0" cy="0" r="1" gradientTransform="translate(100 120) rotate(90) scale(82)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="124" rx="86" ry="72" fill={`url(#${glow})`} />
      <ellipse cx="100" cy="181" rx="58" ry="10" fill="#1E1B4B" opacity="0.22" />

      {/* Stacked books */}
      <g>
        <rect x="42" y="150" width="116" height="20" rx="7" fill={`url(#${bookPurple})`} />
        <rect x="42" y="150" width="116" height="7" rx="3.5" fill="#FFFFFF" opacity="0.18" />
        <rect x="146" y="153" width="7" height="14" rx="2" fill="#FFFFFF" opacity="0.35" />
        <rect x="50" y="132" width="100" height="20" rx="7" fill={`url(#${bookBlue})`} />
        <rect x="50" y="132" width="100" height="7" rx="3.5" fill="#FFFFFF" opacity="0.2" />
        <rect x="137" y="135" width="7" height="14" rx="2" fill="#FFFFFF" opacity="0.35" />
        <rect x="58" y="114" width="84" height="20" rx="7" fill={`url(#${bookAmber})`} />
        <rect x="58" y="114" width="84" height="7" rx="3.5" fill="#FFFFFF" opacity="0.25" />
        <rect x="129" y="117" width="7" height="14" rx="2" fill="#FFFFFF" opacity="0.4" />
      </g>

      {/* Cap base */}
      <path d="M78 96H122L131 121C111 132 89 132 69 121L78 96Z" fill={`url(#${base})`} />
      <path d="M78 96H122L124 103C108 109 92 109 76 103L78 96Z" fill="#FFFFFF" opacity="0.16" />

      {/* Mortarboard */}
      <path d="M100 54L170 88L100 122L30 88L100 54Z" fill={`url(#${board})`} />
      <path d="M100 54L170 88L100 122V54Z" fill={`url(#${boardLight})`} />
      <path d="M100 54L170 88L100 122L30 88L100 54Z" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.2" />

      {/* Button + tassel */}
      <circle cx="100" cy="88" r="6" fill="#FDE68A" />
      <circle cx="100" cy="88" r="2.4" fill="#B45309" opacity="0.55" />
      <path d="M100 90C126 98 142 113 145 136" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="145" cy="139" r="5" fill="#FDE68A" />
      <circle cx="143.5" cy="137.5" r="1.6" fill="#FFFFFF" opacity="0.7" />

      {/* Sparkles */}
      <path d="M162 46L165 54L173 57L165 60L162 68L159 60L151 57L159 54L162 46Z" fill="#FDE68A" opacity="0.9" />
      <path d="M36 60L38 65L43 67L38 69L36 74L34 69L29 67L34 65L36 60Z" fill="#FFFFFF" opacity="0.7" />
      <circle cx="150" cy="78" r="3" fill="#FFFFFF" opacity="0.6" />
      <circle cx="48" cy="100" r="2.4" fill="#FDE68A" opacity="0.7" />
    </svg>
  )
}
