import { View, PerspectiveCamera, Html } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import ReactDOM from 'react-dom'
import { useStore } from '../../store'
import ThumbnailScene from '../ThumbnailScene'
import AnimatedSmiley from './AnimatedSmiley'
import AnimatedCross from './AnimatedCross'

function CameraController({ hovered }: { hovered: boolean }) {
    useFrame((state) => {
        const targetZ = hovered ? 2.5 : 3.5
        state.camera.position.z += (targetZ - state.camera.position.z) * 0.1
    })
    return null
}

const CYBER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:,.<>?'
const ORIGINAL_TEXT = 'create'

function HeroText({ scrollOffset, onClick }: { scrollOffset: number, onClick: () => void }) {
    const [scale, setScale] = useState(1)
    const [displayText, setDisplayText] = useState(ORIGINAL_TEXT)
    const textRef = useRef<HTMLDivElement>(null)
    const intervalRef = useRef<number | null>(null)

    useEffect(() => {
        const resize = () => {
            if (textRef.current) {
                const container = textRef.current.parentElement?.parentElement
                const containerWidth = container?.offsetWidth || window.innerWidth
                const textWidth = textRef.current.scrollWidth

                if (textWidth > 0) {
                    // Scale to fit width (105% for edge-to-edge overflow)
                    const newScale = (containerWidth / textWidth) * 1.05
                    setScale(newScale)
                }
            }
        }
        // Force calculation
        resize()
        setTimeout(resize, 100) // Double check after render
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [])

    const handleMouseEnter = () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = window.setInterval(() => {
            setDisplayText(
                ORIGINAL_TEXT.split('').map(() => CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)]).join('')
            )
        }, 40)
    }

    const handleMouseLeave = () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        let iteration = 0
        const intervalSpeed = 30
        intervalRef.current = window.setInterval(() => {
            setDisplayText(() =>
                ORIGINAL_TEXT.split('').map((_, index) => {
                    if (index < iteration) return ORIGINAL_TEXT[index]
                    return CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)]
                }).join('')
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

    const parallaxY = -scrollOffset * 0.3

    return (
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div
                onClick={onClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                    fontSize: '35vw', // MASSIVE Pure CSS Size. Bypass measurement bugs.
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 900,
                    letterSpacing: '-0.02em', // Relaxed spacing to widen text
                    lineHeight: 0.8,
                    color: '#000',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    // Clean transform without scale
                    transform: `translateY(${parallaxY - 20}px) translateZ(0)`,
                    transformOrigin: 'center center',
                    position: 'relative',
                    cursor: 'pointer',
                    userSelect: 'none',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden'
                }}
            >
                {displayText.split('').map((char, i) => (
                    <span key={i} style={{ display: 'inline-block', transform: (i === 1 && char === 'r') ? 'scaleX(-1)' : 'none' }}>
                        {char}
                    </span>
                ))}
            </div>
        </div>
    )
}

function NavText({ scrolled }: { scrolled: boolean }) {
    const [rChar, setRChar] = useState('r')
    const intervalRef = useRef<number | null>(null)

    useEffect(() => {
        const glitchInterval = setInterval(() => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            intervalRef.current = window.setInterval(() => {
                setRChar(CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)])
            }, 40)
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



const MODES = [
    { id: 'Acid Trip', label: 'ACID', span: 'col-span-1 row-span-2' },
    { id: 'Liquid Metal', label: 'LIQUID', span: 'col-span-2 row-span-2' },
    { id: 'Gradient', label: 'NEON', span: 'col-span-1 row-span-1' },
    { id: 'Lava Lamp', label: 'LAVA', span: 'col-span-1 row-span-1' },
    { id: 'Orbs', label: 'ORBS', span: 'col-span-2 row-span-1' },
    { id: 'Flow Gradient', label: 'FLOW', span: 'col-span-1 row-span-1' },
    { id: 'Ripples', label: 'RIPPLES', span: 'col-span-1 row-span-1' },
    { id: 'Cubic', label: 'cubic', span: 'col-span-2 row-span-2' },
    { id: 'Solid + Glow', label: 'GLOW', span: 'col-span-1 row-span-1' },
    { id: 'Linear Gradient', label: 'LINEAR', span: 'col-span-1 row-span-1' },
    { id: 'Blob Stack', label: 'BLOB', span: 'col-span-2 row-span-1' },
]

function Nav({ scrolled }: { scrolled: boolean }) {
    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '64px', // Explicit height to match Ticker offset
            zIndex: 100,
            padding: '0 16px', // 16px horizontal padding
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: scrolled ? '#fff' : 'transparent',
            borderBottom: scrolled ? '1px solid rgba(0,0,0,0.1)' : 'none',
            transform: scrolled ? 'translateY(0)' : 'translateY(-100%)', // Slide down from top
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s', // Smooth easeOut
            pointerEvents: scrolled ? 'auto' : 'none',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transform: scrolled ? 'translateX(0)' : 'translateX(-20px)', // Logo from left
                opacity: scrolled ? 1 : 0,
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s', // Delay slightly
            }}>
                <AnimatedSmiley size={40} />
                <div style={{
                    transform: scrolled ? 'translateY(0)' : 'translateY(20px)', // Text from bottom
                    opacity: scrolled ? 1 : 0,
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s', // More delay
                }}>
                    <NavText scrolled={scrolled} />
                </div>
            </div>
        </nav>
    )
}

function HeroSection({ scrollOffset, onEnter }: { scrollOffset: number, onEnter: () => void }) {
    return (
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
                transition: 'transform 0.1s ease-out',
                zIndex: 10,
                flexShrink: 0 // Ensure it never collapses
            }}
        >
            <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 10 }}>
                <AnimatedSmiley size={118} />
            </div>
            <HeroText scrollOffset={scrollOffset} onClick={onEnter} />
        </header>
    )
}

// Loading Overlay Component
// Uses Portal to guarantee window-relative positioning
function LoadingScreen({ mode, rect }: { mode: any, rect: DOMRect }) {
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    return ReactDOM.createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.2)', // Semi-transparent to keep context
                backdropFilter: 'blur(4px)', // Subtle focus
                zIndex: 999999,
                pointerEvents: 'none' // Let clicks pass? No, block.
            }}
        >
            <div style={{
                position: 'absolute',
                left: cx,
                top: cy,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1.2 }}
                    transition={{ repeat: Infinity, repeatType: 'mirror', duration: 0.5 }}
                >
                    <AnimatedCross size={100} />
                </motion.div>
            </div>
        </motion.div>,
        document.body
    )
}

export default function LandingPage() {
    const { setScene, setAppState, appState, scene, setGlass } = useStore()
    const [scrolled, setScrolled] = useState(false)
    const [scrollOffset, setScrollOffset] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const [loadingState, setLoadingState] = useState<{ mode: any, rect: DOMRect } | null>(null)

    // Reset scroll on mount
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0
        }
    }, [])

    const handleSelect = (mode: any, rect: DOMRect) => {
        setLoadingState({ mode, rect })
        setAppState('animating')

        setTimeout(() => {
            setScene({ bgMode: mode.id as any })
            setGlass({ enabled: true }) // Ensure enabled
            setAppState('ready')
        }, 1500)
    }

    // Background Carousel Logic
    // Background Carousel Logic
    useEffect(() => {
        // Only cycle in 'intro' mode
        if (appState !== 'intro') {
            return
        }

        // Ensure glass is OFF for intro clarity
        setGlass({ enabled: false })

        let currentIndex = 0
        const interval = setInterval(() => {
            // Pick next mode
            currentIndex = (currentIndex + 1) % MODES.length
            const mode = MODES[currentIndex]
            setScene({ bgMode: mode.id as any })
            // Keep glass off
            setGlass({ enabled: false })
        }, 250) // Faster 250ms

        return () => clearInterval(interval)
    }, [appState, setScene, setGlass])

    const handleScroll = () => {
        if (containerRef.current) {
            const scrollTop = containerRef.current.scrollTop
            const threshold = window.innerHeight * 0.5
            setScrolled(scrollTop > threshold)
            setScrollOffset(scrollTop)
        }
    }

    const handleEnter = () => {
        setLoadingState({ mode: { id: 'Acid Trip' }, rect: new DOMRect(window.innerWidth / 2, window.innerHeight / 2, 0, 0) })
        setAppState('animating')

        setTimeout(() => {
            // Ensure default mode if needed, or just let store persist
            setScene({ bgMode: 'Acid Trip' })
            setGlass({ enabled: true }) // Reset to True
            setAppState('ready')
        }, 1500)
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
                width: '100vw',
                height: '100vh',
                background: 'transparent',
                zIndex: 50,
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                pointerEvents: 'auto'
            }}>

            <div style={{
                position: 'relative',
                width: '100%',
                // Removed fixed height to prevent flex items from shrinking
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingBottom: '100px'
            }}>
                <HeroSection scrollOffset={scrollOffset} onEnter={handleEnter} />
                <Nav scrolled={scrolled} />

                {/* Ticker */}
                <div style={{
                    position: 'sticky',
                    top: '64px', // Matches Nav Fixed Height
                    padding: '0',
                    background: 'transparent',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 1,
                    zIndex: 99,
                    width: '100%',
                    borderBottom: '1px solid rgba(255,255,255,0.3)',
                }}>
                    <div className="ticker-track" style={{ display: 'flex', gap: '16px' }}>
                        {[...Array(50)].map((_, i) => ( // Increased to 50 to prevent clipping
                            <div key={i} style={{ display: 'flex' }}>
                                <span style={{ color: '#fff', fontFamily: 'Inter', fontWeight: 900, textTransform: 'lowercase', fontSize: '28px', lineHeight: 1 }}>
                                    endlessly
                                </span>
                                <span style={{ color: '#fff', fontFamily: 'Inter', fontWeight: 900, fontSize: '28px', lineHeight: 1, margin: '0 8px' }}>
                                    •
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Loading State Overlay */}
            <AnimatePresence>
                {appState === 'animating' && loadingState && (
                    <LoadingScreen mode={loadingState.mode} rect={loadingState.rect} />
                )}
            </AnimatePresence>

            <style>{`
                @keyframes drift {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .ticker-track {
                    display: flex;
                    animation: drift 20s linear infinite;
                    will-change: transform;
                }
                .col-span-1 { grid-column: span 1; }
                .col-span-2 { grid-column: span 2; }
                .row-span-1 { grid-row: span 1; }
                .row-span-2 { grid-row: span 2; }
                @media (max-width: 1200px) {
                    div[style*="grid-template-columns"] {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                @media (max-width: 768px) {
                    div[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div >
    )
}

function GridItem({ mode, onSelect }: {
    mode: any,
    onSelect: (rect: DOMRect) => void,
}) {
    const ref = useRef<HTMLDivElement>(null)
    const [hovered, setHovered] = useState(false)

    return (
        <div
            ref={ref}
            className={`${mode.span || ''} grid-item`}
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                onSelect(rect)
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'visible',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                // Removed scale transform on hover
                transform: 'translateZ(0)',
                transition: 'none'
            }}
        >
            <View track={ref as any} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={50} />
                <CameraController hovered={hovered} />
                <ThumbnailScene mode={mode.id} />
            </View>
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '16px',
                boxShadow: '0 0 0 8px #000',
                pointerEvents: 'none',
                zIndex: -1
            }} />
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                color: '#fff',
                fontFamily: 'Inter',
                fontWeight: 700,
                fontSize: '14px',
                pointerEvents: 'none',
                textTransform: 'lowercase',
                background: 'transparent',
                padding: '4px 12px',
                borderRadius: '100px',
                zIndex: 10
            }}>
                {mode.label}
            </div>
            {/* Removed Hover Border overlay */}
        </div>
    )
}
