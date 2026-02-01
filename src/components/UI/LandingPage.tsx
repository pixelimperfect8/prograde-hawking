import { View, PerspectiveCamera } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { useStore } from '../../store'
import ThumbnailScene from '../ThumbnailScene'
const CYBER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:,.<>?'
const ORIGINAL_TEXT = 'create'

// Hero Text Component with Dynamic Scaling and Glitch Effect
function HeroText({ scrollOffset }: { scrollOffset: number }) {
    const [scale, setScale] = useState(1)
    const [displayText, setDisplayText] = useState(ORIGINAL_TEXT)
    const textRef = useRef<HTMLDivElement>(null)
    const intervalRef = useRef<number | null>(null)

    useEffect(() => {
        const resize = () => {
            if (textRef.current) {
                const container = textRef.current.parentElement?.parentElement
                if (container) {
                    const containerWidth = container.offsetWidth
                    const textWidth = textRef.current.scrollWidth
                    const newScale = containerWidth / textWidth
                    setScale(newScale)
                }
            }
        }

        resize()
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [])



    const handleMouseEnter = () => {
        // Continuous chaos mode on hover
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = window.setInterval(() => {
            setDisplayText(
                ORIGINAL_TEXT.split('').map(() => CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)]).join('')
            )
        }, 40) // Fast Flicker
    }

    const handleMouseLeave = () => {
        // Resolve back to "create"
        if (intervalRef.current) clearInterval(intervalRef.current)

        let iteration = 0
        const intervalSpeed = 30

        intervalRef.current = window.setInterval(() => {
            setDisplayText(() =>
                ORIGINAL_TEXT
                    .split('')
                    .map((_, index) => {
                        if (index < iteration) return ORIGINAL_TEXT[index]
                        return CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)]
                    })
                    .join('')
            )

            iteration += 1 / 3
            if (iteration >= ORIGINAL_TEXT.length) {
                if (intervalRef.current) clearInterval(intervalRef.current)
                setDisplayText(ORIGINAL_TEXT)
            }
        }, intervalSpeed)
    }

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    // Calculate parallax offset (text lags behind scroll by 20%)
    const parallaxY = -scrollOffset * 0.2

    return (
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div
                ref={textRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    fontSize: '200px',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.05em',
                    lineHeight: 1,
                    color: '#000',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    transform: `scale(${scale}) translateY(${parallaxY}px) translateZ(0)`,
                    transformOrigin: 'center center',
                    position: 'relative',
                    left: '-0.5%',
                    cursor: 'pointer',
                    userSelect: 'none',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden'
                }}
            >
                {displayText.split('').map((char, i) => (
                    <span
                        key={i}
                        style={{
                            display: 'inline-block',
                            // Mirror 'r' at index 1
                            transform: (i === 1 && char === 'r') ? 'scaleX(-1)' : 'none'
                        }}
                    >
                        {char}
                    </span>
                ))}
            </div>
        </div>
    )
}

// Nav Text Component with Glitch Effect on 'r'
function NavText({ scrolled }: { scrolled: boolean }) {
    const [rChar, setRChar] = useState('r')
    const intervalRef = useRef<number | null>(null)

    useEffect(() => {
        const glitchInterval = setInterval(() => {
            // Glitch the 'r' character
            if (intervalRef.current) clearInterval(intervalRef.current)

            intervalRef.current = window.setInterval(() => {
                setRChar(CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)])
            }, 40)

            // Resolve back to 'r' after 300ms
            setTimeout(() => {
                if (intervalRef.current) clearInterval(intervalRef.current)

                let iteration = 0
                intervalRef.current = window.setInterval(() => {
                    if (iteration < 3) {
                        setRChar(CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)])
                    } else {
                        if (intervalRef.current) clearInterval(intervalRef.current)
                        setRChar('r')
                    }
                    iteration++
                }, 30)
            }, 300)
        }, 5000)

        return () => {
            clearInterval(glitchInterval)
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    return (
        <div style={{
            fontFamily: 'Inter',
            fontWeight: 900,
            fontSize: '32px',
            letterSpacing: '-0.05em',
            color: '#000',
            transform: scrolled ? 'translateX(0)' : 'translateX(-10px)',
            opacity: scrolled ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
            userSelect: 'none'
        }}>
            c<span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>{rChar}</span>eate
        </div>
    )
}

// Smiley SVG Components
const Smiley1 = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#FFD93D" stroke="#000" strokeWidth="3" />
        <circle cx="35" cy="40" r="3" fill="#000" />
        <path d="M30 55 Q50 70 70 55" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M45 30 L50 35 L55 30" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M50 35 L55 40" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
)

const Smiley2 = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#FFD93D" stroke="#000" strokeWidth="3" />
        <circle cx="35" cy="40" r="3" fill="#000" />
        <path d="M30 55 L70 55" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        <path d="M45 30 L50 35 L55 30" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M50 35 L55 40" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
)

const Smiley3 = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#FFD93D" stroke="#000" strokeWidth="3" />
        <circle cx="35" cy="40" r="3" fill="#000" />
        <path d="M30 50 Q50 65 70 50" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M45 55 Q50 70 55 55" fill="#E63946" stroke="#000" strokeWidth="2" />
        <path d="M45 30 L50 35 L55 30" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M50 35 L55 40" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
)

const Smiley4 = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#FFD93D" stroke="#000" strokeWidth="3" />
        <circle cx="35" cy="40" r="3" fill="#000" />
        <path d="M35 55 L65 55" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        <path d="M45 30 L50 35 L55 30" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M50 35 L55 40" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
)

const Smiley5 = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#FFD93D" stroke="#000" strokeWidth="3" />
        <circle cx="35" cy="40" r="3" fill="#000" />
        <path d="M30 55 Q50 75 70 55" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M45 30 L50 35 L55 30" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M50 35 L55 40" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
)

// Animated Smiley Component
function AnimatedSmiley({ size = 118 }: { size?: number }) {
    const [currentSmiley, setCurrentSmiley] = useState(1)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSmiley((prev) => (prev % 5) + 1)
        }, 150)
        return () => clearInterval(interval)
    }, [])

    return (
        <img
            src={`/smileys/${currentSmiley}.png`}
            alt="Smiley"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                imageRendering: '-webkit-optimize-contrast',
                WebkitFontSmoothing: 'antialiased',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
            }}
        />
    )
}

// Mode Config for the Grid
const MODES = [
    { id: 'Acid Trip', label: 'ACID', span: 'col-span-1 row-span-2' }, // Tall
    { id: 'Liquid Metal', label: 'LIQUID', span: 'col-span-2 row-span-2' }, // Big Square
    { id: 'Gradient', label: 'NEON', span: 'col-span-1 row-span-1' },
    { id: 'Lava Lamp', label: 'LAVA', span: 'col-span-1 row-span-1' },
    { id: 'Orbs', label: 'ORBS', span: 'col-span-2 row-span-1' }, // Wide
    { id: 'Flow Gradient', label: 'FLOW', span: 'col-span-1 row-span-1' },
    { id: 'Ripples', label: 'RIPPLES', span: 'col-span-1 row-span-1' },
    { id: 'Intelligence Glow', label: 'INTEL', span: 'col-span-2 row-span-2' }, // Big Square
    { id: 'Solid + Glow', label: 'GLOW', span: 'col-span-1 row-span-1' },
    { id: 'Linear Gradient', label: 'LINEAR', span: 'col-span-1 row-span-1' },
    { id: 'Blob Stack', label: 'BLOB', span: 'col-span-2 row-span-1' },
]

export default function LandingPage() {
    const { setScene, setAppState } = useStore()
    const [scrolled, setScrolled] = useState(false)
    const [scrollOffset, setScrollOffset] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleSelect = (modeId: string) => {
        setScene({ bgMode: modeId as any })
        setAppState('animating')
        setTimeout(() => setAppState('ready'), 800)
    }

    const handleScroll = () => {
        if (containerRef.current) {
            const scrollTop = containerRef.current.scrollTop
            const threshold = window.innerHeight * 0.5 // Show when halfway past hero
            setScrolled(scrollTop > threshold)
            setScrollOffset(scrollTop)
        }
    }

    return (
        <div
            ref={containerRef}
            className="landing-page"
            onScroll={handleScroll}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                background: '#000',
                zIndex: 50,
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch'
            }}>
            {/* Sticky Nav */}
            <nav style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                padding: '12px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: scrolled ? '#fff' : 'transparent',
                borderBottom: scrolled ? '1px solid rgba(0,0,0,0.1)' : 'none',
                opacity: scrolled ? 1 : 0,
                pointerEvents: scrolled ? 'auto' : 'none',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'background, border-bottom, opacity'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transform: scrolled ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'transform'
                }}>
                    <AnimatedSmiley size={40} />
                    <NavText scrolled={scrolled} />
                </div>
            </nav>


            {/* Hero Section */}
            <header
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width - 0.5
                    const y = (e.clientY - rect.top) / rect.height - 0.5
                    e.currentTarget.style.transform = `perspective(1000px) rotateY(${x * 2}deg) rotateX(${-y * 2}deg)`
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'
                }}
                style={{
                    height: '80vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    width: '100%',
                    padding: '0',
                    background: '#fff',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'transform 0.1s ease-out'
                }}
            >
                {/* Animated Smiley Logo - Top Left */}
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '40px',
                    zIndex: 10
                }}>
                    <AnimatedSmiley size={118} />
                </div>

                <HeroText scrollOffset={scrollOffset} />
            </header>

            {/* Ticker */}
            <div style={{
                position: 'sticky',
                top: '64px',
                padding: '0',
                background: '#000',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1,
                zIndex: 99
            }}>
                <div className="ticker-track" style={{ display: 'flex', gap: '16px' }}>
                    {/* Repeated Text - doubled for seamless loop */}
                    {[...Array(40)].map((_, i) => (
                        <>
                            <span key={`word-${i}`} style={{
                                color: '#fff',
                                fontFamily: 'Inter',
                                fontWeight: 900,
                                textTransform: 'lowercase',
                                fontSize: '28px',
                                lineHeight: 1
                            }}>
                                endlessly
                            </span>
                            <span key={`dot-${i}`} style={{
                                color: '#fff',
                                fontFamily: 'Inter',
                                fontWeight: 900,
                                fontSize: '28px',
                                lineHeight: 1
                            }}>
                                •
                            </span>
                        </>
                    ))}
                </div>
            </div>

            {/* Imperfect Bento Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridAutoRows: '300px',
                gap: '12px',
                padding: '100px 12px 12px 12px',
                maxWidth: '1600px',
                margin: '0 auto',
                background: 'transparent'
            }}>
                {MODES.map((mode) => (
                    <GridItem
                        key={mode.id}
                        mode={mode}
                        onSelect={() => handleSelect(mode.id)}
                    />
                ))}
            </div>

            {/* Footer space */}
            <div style={{ height: '200px' }} />

            <style>{`
                @keyframes gradientFlow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes drift {
                    0% { transform: translateX(0) translateZ(0); }
                    100% { transform: translateX(-50%) translateZ(0); }
                }

                .ticker-track {
                    display: flex;
                    animation: drift 20s linear infinite;
                    will-change: transform;
                    backface-visibility: hidden;
                }

                .col-span-1 { grid-column: span 1; }
                .col-span-2 { grid-column: span 2; }
                .row-span-1 { grid-row: span 1; }
                .row-span-2 { grid-row: span 2; }

                /* Mobile Adjustment */
                @media (max-width: 768px) {
                    .landing-page .grid {
                        grid-template-columns: 1fr !important;
                        auto-rows: 250px !important;
                    }
                    .col-span-1, .col-span-2 { grid-column: span 1 !important; }
                    .row-span-1, .row-span-2 { grid-row: span 1 !important; }
                }

                /* Gradient Preview Styles */
                .gradient-preview {
                    background-size: 200% 200%;
                    animation: gradientFlow 8s ease infinite;
                }

                .gradient-gradient {
                    background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #667eea);
                }

                .gradient-lava-lamp {
                    background: radial-gradient(circle at 20% 50%, #f093fb 0%, transparent 50%),
                                radial-gradient(circle at 80% 80%, #f5576c 0%, transparent 50%),
                                radial-gradient(circle at 40% 20%, #fa709a 0%, transparent 50%),
                                #1a1a1a;
                    animation: lavaMove 10s ease-in-out infinite;
                }

                @keyframes lavaMove {
                    0%, 100% { background-position: 0% 0%, 100% 100%, 50% 0%; }
                    50% { background-position: 100% 100%, 0% 0%, 0% 100%; }
                }

                .gradient-blob-stack {
                    background: linear-gradient(135deg, #4facfe, #00f2fe, #43e97b, #4facfe);
                }

                .gradient-orbs {
                    background: radial-gradient(circle at 30% 30%, #43e97b 0%, transparent 40%),
                                radial-gradient(circle at 70% 70%, #38f9d7 0%, transparent 40%),
                                radial-gradient(circle at 50% 80%, #30cfd0 0%, transparent 40%),
                                #0a0a0a;
                }

                .gradient-acid-trip {
                    background: linear-gradient(45deg, #fa709a, #fee140, #f093fb, #764ba2, #fa709a);
                    animation: acidSpin 15s linear infinite;
                }

                @keyframes acidSpin {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }

                .gradient-ripples {
                    background: repeating-radial-gradient(circle at 50% 50%, #30cfd0 0%, #330867 10%, #30cfd0 20%);
                    animation: rippleExpand 6s ease-in-out infinite;
                }

                @keyframes rippleExpand {
                    0%, 100% { background-size: 100% 100%; }
                    50% { background-size: 150% 150%; }
                }

                .gradient-liquid-metal {
                    background: linear-gradient(135deg, #a8edea, #fed6e3, #d299c2, #a8edea);
                }

                .gradient-linear-gradient {
                    background: linear-gradient(90deg, #ff9a9e, #fecfef, #fbc2eb, #ff9a9e);
                }

                .gradient-flow-gradient {
                    background: linear-gradient(135deg, #ffecd2, #fcb69f, #ff9a9e, #ffecd2);
                    animation: flowMove 12s ease infinite;
                }

                @keyframes flowMove {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                .gradient-intelligence-glow {
                    background: radial-gradient(ellipse at center, #a1c4fd 0%, #c2e9fb 50%, #667eea 100%);
                    animation: glowPulse 4s ease-in-out infinite;
                }

                @keyframes glowPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
            `}</style>
        </div>
    )
}

function GridItem({ mode, onSelect }: { mode: any, onSelect: () => void }) {
    const ref = useRef<HTMLDivElement>(null)
    const [hovered, setHovered] = useState(false)

    return (
        <div
            ref={ref}
            className={`${mode.span} grid-item`}
            onClick={onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                transform: hovered ? 'scale(0.98) translateZ(0)' : 'scale(1) translateZ(0)',
                willChange: 'transform',
                backfaceVisibility: 'hidden'
            }}
        >
            {/* Gradient Preview - Animated CSS */}
            <div
                className={`gradient-preview gradient-${mode.id.toLowerCase().replace(/\s+/g, '-')}`}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}
            />

            {/* Overlay Label */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: '#fff',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '14px',
                pointerEvents: 'none',
                textTransform: 'uppercase',
                background: 'rgba(0,0,0,0.5)',
                padding: '4px 12px',
                borderRadius: '100px',
                backdropFilter: 'blur(4px)'
            }}>
                {mode.label}
            </div>

            {/* Hover Glitch Overlay (Optional) */}
            {hovered && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    border: '2px solid rgba(255,255,255,0.5)',
                    borderRadius: '16px',
                    pointerEvents: 'none'
                }} />
            )}
        </div>
    )
}
