export const LeftOliveBranch = () => (
  <svg viewBox="0 0 450 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <linearGradient id="goldGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dfcfb3" />
        <stop offset="50%" stopColor="#bda37a" />
        <stop offset="100%" stopColor="#806846" />
      </linearGradient>
      <linearGradient id="oliveGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8a9c54" />
        <stop offset="50%" stopColor="#556b2f" />
        <stop offset="100%" stopColor="#2c3a14" />
      </linearGradient>
    </defs>
    <path d="M20,320 C100,280 220,180 280,60" stroke="url(#goldGradLeft)" strokeWidth="3" strokeLinecap="round" />
    <path d="M120,220 C150,180 180,150 210,130" stroke="url(#goldGradLeft)" strokeWidth="1.8" />
    <path d="M70,260 C90,210 130,180 160,165" stroke="url(#goldGradLeft)" strokeWidth="1.8" />

    <path d="M280,60 C300,45 330,55 350,75 C330,85 295,80 280,60 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M230,110 C250,90 290,85 310,100 C290,115 255,120 230,110 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M190,140 C210,120 250,125 270,145 C250,155 210,150 190,140 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M140,180 C160,160 200,165 220,185 C200,195 160,190 140,180 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M90,225 C115,205 150,210 170,230 C150,240 115,235 90,225 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />

    <g filter="drop-shadow(2px 5px 6px rgba(0,0,0,0.35))">
      <ellipse cx="215" cy="125" rx="12" ry="18" transform="rotate(-30 215 125)" fill="url(#oliveGradLeft)" stroke="#273310" strokeWidth="1" />
      <circle cx="211" cy="120" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="130" cy="190" rx="11" ry="17" transform="rotate(40 130 190)" fill="url(#oliveGradLeft)" stroke="#273310" strokeWidth="1" />
      <circle cx="127" cy="185" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="255" cy="85" rx="11" ry="17" transform="rotate(10 255 85)" fill="url(#oliveGradLeft)" stroke="#273310" strokeWidth="1" />
      <circle cx="252" cy="80" r="3" fill="#ffffff" opacity="0.25" />
    </g>
  </svg>
)

export const RightOliveBranch = () => (
  <svg viewBox="0 0 450 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <linearGradient id="goldGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#dfcfb3" />
        <stop offset="50%" stopColor="#bda37a" />
        <stop offset="100%" stopColor="#806846" />
      </linearGradient>
      <linearGradient id="oliveGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8a9c54" />
        <stop offset="50%" stopColor="#556b2f" />
        <stop offset="100%" stopColor="#2c3a14" />
      </linearGradient>
    </defs>
    <path d="M430,320 C350,280 230,180 170,60" stroke="url(#goldGradRight)" strokeWidth="3" strokeLinecap="round" />
    <path d="M330,220 C300,180 270,150 240,130" stroke="url(#goldGradRight)" strokeWidth="1.8" />
    <path d="M380,260 C360,210 320,180 290,165" stroke="url(#goldGradRight)" strokeWidth="1.8" />

    <path d="M170,60 C150,45 120,55 100,75 C120,85 155,80 170,60 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M220,110 C200,90 160,85 140,100 C160,115 195,120 220,110 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M260,140 C240,120 200,125 180,145 C200,155 240,150 260,140 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M310,180 C290,160 250,165 230,185 C250,195 290,190 310,180 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M360,225 C335,205 300,210 280,230 C300,240 335,235 360,225 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />

    <g filter="drop-shadow(-2px 5px 6px rgba(0,0,0,0.35))">
      <ellipse cx="235" cy="125" rx="12" ry="18" transform="rotate(30 235 125)" fill="url(#oliveGradRight)" stroke="#273310" strokeWidth="1" />
      <circle cx="239" cy="120" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="320" cy="190" rx="11" ry="17" transform="rotate(-40 320 190)" fill="url(#oliveGradRight)" stroke="#273310" strokeWidth="1" />
      <circle cx="323" cy="185" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="195" cy="85" rx="11" ry="17" transform="rotate(-10 195 85)" fill="url(#oliveGradRight)" stroke="#273310" strokeWidth="1" />
      <circle cx="198" cy="80" r="3" fill="#ffffff" opacity="0.25" />
    </g>
  </svg>
)
