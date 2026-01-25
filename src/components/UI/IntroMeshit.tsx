import { useRef, useEffect, useState } from 'react'
import { useStore } from '../../store'

export default function IntroMeshit() {
    const { appState, setAppState } = useStore()
    const containerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLHeadingElement>(null)

    // Parallax State
    const mouse = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (appState !== 'intro') return
            const x = (e.clientX / window.innerWidth) - 0.5
            const y = (e.clientY / window.innerHeight) - 0.5

            // Subtle parallax
            if (textRef.current) {
                textRef.current.style.transform = `translate(${x * -30}px, ${y * -30}px)`
            }
        }
        window.addEventListener('mousemove', handleMove)
        return () => window.removeEventListener('mousemove', handleMove)
    }, [appState])

    const handleClick = () => {
        if (appState !== 'intro') return
        setAppState('animating')

        // Animation timing matches CSS
        setTimeout(() => {
            setAppState('ready')
        }, 1200) // 1.2s for explosion + flight
    }

    if (appState === 'ready') return null

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
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
                cursor: 'pointer',
                pointerEvents: appState === 'intro' ? 'auto' : 'none'
            }}
        >
            {/* Main Text */}
            <h1
                ref={textRef}
                className={appState === 'animating' ? 'mesh-explode-main' : ''}
                style={{
                    margin: 0,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 900,
                    color: '#FBFF00',
                    fontSize: 'clamp(4rem, 7.2vw, 13rem)',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                    textAlign: 'center',
                    mixBlendMode: 'overlay',
                    transition: 'transform 0.1s ease-out', // smooth mouse follow
                    position: 'relative' // for stacking
                }}
            >
                MESHIT
            </h1>

            {/* Duplicates for Explosion (Only render when animating) */}
            {appState === 'animating' && (
                <>
                    {/* TOP */}
                    <ExplodeClone direction="top" />
                    {/* BOTTOM */}
                    <ExplodeClone direction="bottom" />
                    {/* LEFT */}
                    <ExplodeClone direction="left" />
                    {/* RIGHT */}
                    <ExplodeClone direction="right" />
                </>
            )}

            <style>{`
                @keyframes flyOutTop {
                    0% { opacity: 1; transform: translate(0, 0); }
                    100% { opacity: 0; transform: translate(0, -100vh) scale(1.5); filter: blur(20px); }
                }
                @keyframes flyOutBottom {
                    0% { opacity: 1; transform: translate(0, 0); }
                    100% { opacity: 0; transform: translate(0, 100vh) scale(1.5); filter: blur(20px); }
                }
                @keyframes flyOutLeft {
                    0% { opacity: 1; transform: translate(0, 0); }
                    100% { opacity: 0; transform: translate(-100vw, 0) scale(1.5); filter: blur(20px); }
                }
                @keyframes flyOutRight {
                    0% { opacity: 1; transform: translate(0, 0); }
                    100% { opacity: 0; transform: translate(100vw, 0) scale(1.5); filter: blur(20px); }
                }
                @keyframes fadeMain {
                    0% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(3); filter: blur(50px); } // explode main
                }

                .mesh-explode-main {
                    animation: fadeMain 1s ease-in forwards;
                }
            `}</style>
        </div>
    )
}

function ExplodeClone({ direction }: { direction: 'top' | 'bottom' | 'left' | 'right' }) {
    const animMap = {
        top: 'flyOutTop',
        bottom: 'flyOutBottom',
        left: 'flyOutLeft',
        right: 'flyOutRight'
    }

    return (
        <h1
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                margin: 0,
                transform: 'translate(-50%, -50%)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                color: '#FBFF00',
                fontSize: 'clamp(4rem, 7.2vw, 13rem)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                textAlign: 'center',
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
                animation: `${animMap[direction]} 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards`
            }}
        >
            MESHIT
        </h1>
    )
}
