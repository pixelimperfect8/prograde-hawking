import { useRef, useState, useMemo } from 'react'
import { useStore } from '../../store'

export default function IntroMeshit() {
    const { appState, setAppState } = useStore()
    const textRef = useRef<HTMLHeadingElement>(null)
    const [isHovered, setIsHovered] = useState(false)

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
        setIsHovered(false)
        e.currentTarget.style.transform = `translate(0, 0) scale(1)`
    }

    const handleClick = () => {
        if (appState !== 'intro') return
        setAppState('animating')

        // Animation timing matches CSS
        setTimeout(() => {
            setAppState('ready')
        }, 1500)
    }

    // Generate Grid Positions for "MESHIT" wall
    // 5 rows above, 5 rows below, spanning full width
    const clones = useMemo(() => {
        const arr = []
        for (let y = -6; y <= 6; y++) {
            // Let's do a grid of 5x13 (x: -2 to 2)
            for (let x = -2; x <= 2; x++) {
                if (x === 0 && y === 0) continue // Skip center (main text)
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
                // We handle clicks on the text itself
                pointerEvents: 'none'
            }}
        >
            {/* Main Text */}
            <h1
                ref={textRef}
                onClick={handleClick}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                className={appState === 'animating' ? 'mesh-explode-main' : ''}
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
                    pointerEvents: 'auto', // Enable pointer events for text
                    zIndex: 10
                }}
            >
                MESHIT
            </h1>

            {/* Grid Explosion (Only render when animating) */}
            {appState === 'animating' && clones.map((pos, i) => (
                <ExplodeClone key={i} x={pos.x} y={pos.y} />
            ))}

            <style>{`
                @keyframes gridExpand {
                    0% { 
                        opacity: 0; 
                        transform: translate(-50%, -50%) scale(0.5); 
                    }
                    20% {
                        opacity: 1;
                        transform: translate(
                            calc(-50% + var(--tx)), 
                            calc(-50% + var(--ty))
                        ) scale(1);
                    }
                    80% {
                         opacity: 1;
                         transform: translate(
                            calc(-50% + var(--tx)), 
                            calc(-50% + var(--ty))
                        ) scale(1);
                        filter: blur(0px);
                    }
                    100% { 
                        opacity: 0; 
                        transform: translate(
                            calc(-50% + var(--tx)), 
                            calc(-50% + var(--ty) - 100vh)
                        ) scale(1);
                        filter: blur(10px);
                    }
                }
                
                @keyframes mainExit {
                    0% { transform: scale(1); opacity: 1; }
                    20% { transform: scale(1); opacity: 1; }
                    100% { transform: translateY(-100vh); opacity: 0; filter: blur(10px); }
                }

                .mesh-explode-main {
                    animation: mainExit 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
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
                animation: 'gridExpand 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            }}
        >
            MESHIT
        </h1>
    )
}
