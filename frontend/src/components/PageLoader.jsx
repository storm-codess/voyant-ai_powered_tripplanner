import { useEffect, useState } from 'react'

const LOADING_STATES = [
  {
    text: 'Packing your bags...',
    subtext: 'Getting everything ready',
    svg: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        {/* suitcase */}
        <rect x="15" y="28" width="50" height="38" rx="4" stroke="#c8e64c" strokeWidth="2.5" fill="none"/>
        <rect x="28" y="20" width="24" height="10" rx="3" stroke="#c8e64c" strokeWidth="2.5" fill="none"/>
        <line x1="15" y1="44" x2="65" y2="44" stroke="#c8e64c" strokeWidth="2"/>
        <circle cx="40" cy="47" r="3" fill="#c8e64c"/>
        {/* wheels */}
        <circle cx="24" cy="68" r="4" stroke="#c8e64c" strokeWidth="2" fill="none"/>
        <circle cx="56" cy="68" r="4" stroke="#c8e64c" strokeWidth="2" fill="none"/>
        {/* handle */}
        <path d="M32 28 L32 22" stroke="#c8e64c" strokeWidth="2"/>
        <path d="M48 28 L48 22" stroke="#c8e64c" strokeWidth="2"/>
      </svg>
    )
  },
  {
    text: 'Checking the map...',
    subtext: 'Finding the best routes',
    svg: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        {/* map */}
        <path d="M15 20 L30 15 L50 25 L65 20 L65 60 L50 65 L30 55 L15 60 Z" stroke="#c8e64c" strokeWidth="2.5" fill="none"/>
        <path d="M30 15 L30 55" stroke="#c8e64c" strokeWidth="1.5" strokeDasharray="3 3"/>
        <path d="M50 25 L50 65" stroke="#c8e64c" strokeWidth="1.5" strokeDasharray="3 3"/>
        {/* pin */}
        <circle cx="42" cy="35" r="5" stroke="#c8e64c" strokeWidth="2" fill="none"/>
        <path d="M42 40 L42 48" stroke="#c8e64c" strokeWidth="2"/>
        <circle cx="42" cy="35" r="2" fill="#c8e64c"/>
      </svg>
    )
  },
  {
    text: 'Booking your flight...',
    subtext: 'Clearing for takeoff',
    svg: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        {/* plane */}
        <path d="M12 44 L35 38 L52 18 C55 14 62 15 63 20 C64 25 60 30 55 31 L40 35 L45 55 L36 58 L28 42 L20 44 L18 52 L12 54 Z" stroke="#c8e64c" strokeWidth="2" fill="none"/>
        {/* clouds */}
        <path d="M55 55 Q58 50 63 52 Q65 47 70 50 Q72 55 68 57 Z" stroke="#c8e64c" strokeWidth="1.5" fill="none" opacity="0.5"/>
        <path d="M10 30 Q13 25 18 27 Q20 22 25 25 Q27 30 23 32 Z" stroke="#c8e64c" strokeWidth="1.5" fill="none" opacity="0.5"/>
      </svg>
    )
  },
  {
    text: 'AI is thinking...',
    subtext: 'Crunching group preferences',
    svg: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        {/* brain/circuit */}
        <circle cx="40" cy="40" r="22" stroke="#c8e64c" strokeWidth="2" fill="none"/>
        <circle cx="40" cy="40" r="4" fill="#c8e64c"/>
        {/* circuit lines */}
        <line x1="40" y1="18" x2="40" y2="28" stroke="#c8e64c" strokeWidth="1.5"/>
        <line x1="40" y1="52" x2="40" y2="62" stroke="#c8e64c" strokeWidth="1.5"/>
        <line x1="18" y1="40" x2="28" y2="40" stroke="#c8e64c" strokeWidth="1.5"/>
        <line x1="52" y1="40" x2="62" y2="40" stroke="#c8e64c" strokeWidth="1.5"/>
        <circle cx="40" cy="16" r="3" fill="none" stroke="#c8e64c" strokeWidth="1.5"/>
        <circle cx="40" cy="64" r="3" fill="none" stroke="#c8e64c" strokeWidth="1.5"/>
        <circle cx="16" cy="40" r="3" fill="none" stroke="#c8e64c" strokeWidth="1.5"/>
        <circle cx="64" cy="40" r="3" fill="none" stroke="#c8e64c" strokeWidth="1.5"/>
        {/* diagonal */}
        <line x1="25" y1="25" x2="32" y2="32" stroke="#c8e64c" strokeWidth="1.5"/>
        <line x1="48" y1="48" x2="55" y2="55" stroke="#c8e64c" strokeWidth="1.5"/>
        <line x1="55" y1="25" x2="48" y2="32" stroke="#c8e64c" strokeWidth="1.5"/>
        <line x1="32" y1="48" x2="25" y2="55" stroke="#c8e64c" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    text: 'Calling the group...',
    subtext: 'Getting everyone on board',
    svg: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        {/* group of people */}
        <circle cx="25" cy="25" r="8" stroke="#c8e64c" strokeWidth="2" fill="none"/>
        <path d="M10 50 C10 38 40 38 40 50" stroke="#c8e64c" strokeWidth="2" fill="none"/>
        <circle cx="55" cy="25" r="8" stroke="#c8e64c" strokeWidth="2" fill="none"/>
        <path d="M40 50 C40 38 70 38 70 50" stroke="#c8e64c" strokeWidth="2" fill="none"/>
        {/* chat bubble */}
        <rect x="30" y="52" width="20" height="14" rx="3" stroke="#c8e64c" strokeWidth="1.5" fill="none"/>
        <path d="M38 66 L40 70 L42 66" stroke="#c8e64c" strokeWidth="1.5" fill="none"/>
        <line x1="34" y1="57" x2="46" y2="57" stroke="#c8e64c" strokeWidth="1.5"/>
        <line x1="34" y1="61" x2="42" y2="61" stroke="#c8e64c" strokeWidth="1.5"/>
      </svg>
    )
  },
]

export default function PageLoader() {
  const [currentIndex, setCurrentIndex] = useState(() => 
    Math.floor(Math.random() * LOADING_STATES.length)
  )
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % LOADING_STATES.length)
        setVisible(true)
      }, 200)
    }, 900)

    return () => clearInterval(interval)
  }, [])

  const current = LOADING_STATES[currentIndex]

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: '#0f1515' }}
    >
      {/* logo */}
      <h1
        className="text-3xl tracking-widest mb-16"
        style={{ fontFamily: 'Bebas Neue, cursive', color: '#c8e64c' }}
      >
        VOYANT
      </h1>

      {/* animated SVG */}
      <div
        className="transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)'
        }}
      >
        {current.svg}
      </div>

      {/* pulsing ring around svg */}
      <div className="relative flex items-center justify-center mt-[-80px] mb-[80px]">
        <div
          className="absolute w-28 h-28 rounded-full animate-ping"
          style={{ backgroundColor: 'rgba(200,230,76,0.08)' }}
        />
        <div
          className="absolute w-24 h-24 rounded-full"
          style={{ border: '1px solid rgba(200,230,76,0.15)' }}
        />
      </div>

      {/* text */}
      <div
        className="text-center transition-all duration-300 mt-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)'
        }}
      >
        <p
          className="text-xl font-semibold text-white mb-1"
          style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '24px', letterSpacing: '2px' }}
        >
          {current.text}
        </p>
        <p className="text-sm" style={{ color: '#8a9e9e' }}>
          {current.subtext}
        </p>
      </div>

      {/* progress dots */}
      <div className="flex items-center gap-2 mt-10">
        {LOADING_STATES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? '24px' : '6px',
              height: '6px',
              backgroundColor: i === currentIndex ? '#c8e64c' : 'rgba(255,255,255,0.15)'
            }}
          />
        ))}
      </div>

      {/* bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-0.5 animate-pulse"
        style={{
          width: `${((currentIndex + 1) / LOADING_STATES.length) * 100}%`,
          backgroundColor: '#c8e64c',
          transition: 'width 1.8s ease'
        }}
      />
    </div>
  )
}