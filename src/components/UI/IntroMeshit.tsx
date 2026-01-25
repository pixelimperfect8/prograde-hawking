import { useRef, useMemo } from 'react'
import { useStore } from '../../store'

export default function IntroMeshit() {
    const { appState, setAppState } = useStore()
    const textRef = useRef<HTMLHeadingElement>(null)

    // Parallax only on hover
    const handleMouseMove = (e: React.MouseEvent<HTMLHeadingElement>) => {
        if (appState !== 'intro') return

        // Calculate relative to the element center
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5

        e.currentTarget.style.transform = `translate(${x * -20}px, ${y * -20}px) scale(1.05)`
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLHeadingElement>) => {
        e.currentTarget.style.transform = `translate(0, 0) scale(1)`
    }

    const handleClick = () => {
        if (appState !== 'intro') return
        setAppState('animating')

        // Animation timing: 4s total (0.5s expand, 3s hold, 0.5s exit)
        setTimeout(() => {
            setAppState('ready')
        }, 4000)
    }

    // Generate Grid Positions for "MESHIT" wall
    const clones = useMemo(() => {
        const arr = []
        for (let y = -6; y <= 6; y++) {
            for (let x = -2; x <= 2; x++) {
                // Include center (0,0) so it's part of the cohesive grid animation
                arr.push({ x, y })
            }
        }
        return arr
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
                pointerEvents: 'none'
            }}
        >
            {/* Main Text - Hidden when animating, replaced by grid clone (0,0) */}
            {appState === 'intro' && (
                <h1
                    ref={textRef}
                    onClick={handleClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        margin: 0,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 900,
                        color: '#FBFF00',
                        fontSize: 'clamp(4rem, 7.2vw, 13rem)',
                        letterSpacing: '-0.04em',
                        lineHeight: 0.85,
                        textAlign: 'center',
                        mixBlendMode: 'overlay',
                        transition: 'transform 0.1s ease-out',
                        position: 'relative',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        zIndex: 10
                    }}
                >
                    MESHIT
                </h1>
            )}

            {/* Grid Explosion (Renders EVERYTHING including center when animating) */}
            {appState === 'animating' && clones.map((pos, i) => (
                <ExplodeClone key={i} x={pos.x} y={pos.y} />
            ))}

            <style>{`
                @keyframes gridExpand {
                    /* Rapid Expand (0.5s) */
                    0% { 
                        opacity: 0; 
                        transform: translate(-50%, -50%) scale(0.5); 
                    }
                    10% {
                        opacity: 1;
                        transform: translate(
                            calc(-50% + var(--tx)), 
                            calc(-50% + var(--ty))
                        ) scale(1);
                    }
                    /* LONG HOLD (~3s) */
                    85% {
                         opacity: 1;
                         transform: translate(
                            calc(-50% + var(--tx)), 
                            calc(-50% + var(--ty))
                        ) scale(1);
                        filter: blur(0px);
                    }
                    /* Quick Exit (0.5s) */
                    100% { 
                        opacity: 0; 
                        transform: translate(
                            calc(-50% + var(--tx)), 
                            calc(-50% + var(--ty) - 100vh) /* Fly Up */
                        ) scale(1);
                        filter: blur(10px);
                    }
                }
            `}</style>
        </div>
    )
}

function ExplodeClone({ x, y }: { x: number, y: number }) {
    return (
        <h1
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                margin: 0,
                // @ts-ignore
                '--tx': `${x * 100}%`,
                // @ts-ignore
                '--ty': `${y * 85}%`,

                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                color: '#FBFF00',
                fontSize: 'clamp(4rem, 7.2vw, 13rem)',
                letterSpacing: '-0.04em',
                lineHeight: 0.85,
                textAlign: 'center',
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                // 4s Duration
                animation: 'gridExpand 4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            }}
        >
            MESHIT
        </h1>
    )
}
