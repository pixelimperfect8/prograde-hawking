import { useRef, useState, useEffect, useCallback } from 'react'
import { useStore } from '../../store'

const CYBER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:,.<>?'
const ORIGINAL_TEXT = 'MESHIT'

export default function IntroMeshit() {
    const { appState, setAppState } = useStore()
    const [displayText, setDisplayText] = useState(ORIGINAL_TEXT)
    const intervalRef = useRef<number | null>(null)
    const isAnimatingRef = useRef(false)

    // Scramble Logic
    const scramble = useCallback((resolveToOriginal = false) => {
        if (intervalRef.current) clearInterval(intervalRef.current)

        let iteration = 0
        // Slower or faster based on action
        const intervalSpeed = resolveToOriginal ? 30 : 50

        intervalRef.current = window.setInterval(() => {
            setDisplayText(() =>
                ORIGINAL_TEXT
                    .split('')
                    .map((_, index) => {
                        // If resolving, keep original char if we've passed enough iterations for it
                        if (resolveToOriginal) {
                            if (index < iteration) return ORIGINAL_TEXT[index]
                        }
                        // Otherwise return random char
                        return CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)]
                    })
                    .join('')
            )

            if (resolveToOriginal) {
                iteration += 1 / 3 // Resolve 1/3 letter per tick
                if (iteration >= ORIGINAL_TEXT.length) {
                    if (intervalRef.current) clearInterval(intervalRef.current)
                    setDisplayText(ORIGINAL_TEXT)
                }
            }
        }, intervalSpeed)
    }, [])

    const handleMouseEnter = () => {
        if (appState !== 'intro' || isAnimatingRef.current) return

        // Continuous chaos mode on hover
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = window.setInterval(() => {
            setDisplayText(
                ORIGINAL_TEXT.split('').map(() => CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)]).join('')
            )
        }, 40) // Fast Flicker
    }

    const handleMouseLeave = () => {
        if (appState !== 'intro' || isAnimatingRef.current) return
        // Resolve back to "MESHIT"
        scramble(true)
    }

    const handleClick = () => {
        if (appState !== 'intro') return
        isAnimatingRef.current = true
        setAppState('animating')

        // Intense scramble (Meltdown)
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = window.setInterval(() => {
            setDisplayText(
                ORIGINAL_TEXT.split('').map(() => CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)]).join('')
            )
        }, 15) // Extremely fast chaos

        setTimeout(() => {
            if (intervalRef.current) clearInterval(intervalRef.current)
            setAppState('ready')
        }, 800)
    }

    // Cleanup
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    if (appState === 'ready') return null

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 50,
                pointerEvents: 'auto',
                background: appState === 'animating' ? 'rgba(0,0,0,0)' : 'transparent',
                transition: 'background 0.5s',
                mixBlendMode: 'normal'
            }}
        >
            <h1
                className={`cipher-text ${appState === 'animating' ? 'fade-out' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {displayText.split('').map((char, i) => (
                    <span
                        key={i}
                        style={{
                            display: 'inline-block',
                            // Mirror S at index 2 (MESHIT -> S is 2)
                            transform: (i === 2 && char === 'S') ? 'scaleX(-1)' : 'none'
                        }}
                    >
                        {char}
                    </span>
                ))}
            </h1>

            <style>{`
                .cipher-text {
                    margin: 0;
                    font-family: 'Inter', sans-serif; /* Back to Bold Sans */
                    font-weight: 900;
                    font-size: clamp(4rem, 7.2vw, 13rem);
                    letter-spacing: -0.04em;
                    line-height: 0.85;
                    color: #FBFF00;
                    text-align: center;
                    cursor: pointer;
                    user-select: none;
                    mix-blend-mode: overlay;
                    transition: opacity 0.4s ease;
                    /* Ensure font distinctness for glyphs */
                    font-variant-numeric: tabular-nums;

                    /* Make it taller */
                    transform: scaleY(1.3);
                    transform-origin: center;
                }

                .fade-out {
                    opacity: 0;
                    transform: scale(1.1);
                    filter: blur(10px);
                    transition: opacity 0.8s ease, transform 0.8s ease, filter 0.8s ease;
                }
            `}</style>
        </div>
    )
}
