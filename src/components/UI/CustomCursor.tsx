import { useEffect, useRef } from 'react'

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const pos = useRef({ x: 0, y: 0 })
    const glitch = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            pos.current = { x: e.clientX, y: e.clientY }
            // Direct DOM update for instant response
            if (cursorRef.current) {
                const { x, y } = pos.current
                const { x: gx, y: gy } = glitch.current
                cursorRef.current.style.transform = `translate3d(${x + gx}px, ${y + gy}px, 0) translate(-50%, -50%)`
            }
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Glitch Loop (Direct DOM)
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.9) {
                glitch.current = {
                    x: (Math.random() - 0.5) * 10,
                    y: (Math.random() - 0.5) * 10
                }
                // Apply glitch immediately
                if (cursorRef.current) {
                    const { x, y } = pos.current
                    const { x: gx, y: gy } = glitch.current
                    cursorRef.current.style.transform = `translate3d(${x + gx}px, ${y + gy}px, 0) translate(-50%, -50%)`
                }

                // Reset after 50ms
                setTimeout(() => {
                    glitch.current = { x: 0, y: 0 }
                    if (cursorRef.current) {
                        const { x, y } = pos.current
                        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
                    }
                }, 50)
            }
        }, 100)
        return () => clearInterval(interval)
    }, [])

    return (
        <div
            ref={cursorRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '24px',
                height: '24px',
                backgroundColor: '#FBFF00', // Yellow
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 9999,
                mixBlendMode: 'difference',
                willChange: 'transform',
                // Initial off-screen
                transform: 'translate3d(-100px, -100px, 0)'
            }}
        />
    )
}
