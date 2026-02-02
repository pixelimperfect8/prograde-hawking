import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const pos = useRef({ x: 0, y: 0 })
    const glitch = useRef({ x: 0, y: 0 })
    const [isHoveringPanel, setIsHoveringPanel] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Hook for mobile check
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Hook for mouse move
    useEffect(() => {
        if (isMobile) return // Don't attach listener on mobile

        const handleMouseMove = (e: MouseEvent) => {
            pos.current = { x: e.clientX, y: e.clientY }

            // Check hover state (efficient enough for mousemove)
            const target = e.target as HTMLElement
            const isOverPanel = !!target.closest('#ui-panel')
            setIsHoveringPanel(isOverPanel)

            // Direct DOM update for instant response
            if (cursorRef.current) {
                const { x, y } = pos.current
                const { x: gx, y: gy } = glitch.current
                cursorRef.current.style.transform = `translate3d(${x + gx}px, ${y + gy}px, 0) translate(-50%, -50%)`
            }
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [isMobile])



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

    if (isMobile) return null

    return (
        <div
            ref={cursorRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: isHoveringPanel ? '24px' : '64px',
                height: isHoveringPanel ? '24px' : '64px',
                backgroundColor: isHoveringPanel ? '#FBFF00' : 'transparent',
                backgroundImage: isHoveringPanel ? 'none' : 'url(/cursor-smiley.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                borderRadius: isHoveringPanel ? '50%' : '0',
                pointerEvents: 'none',
                zIndex: 9999,
                mixBlendMode: isHoveringPanel ? 'difference' : 'normal', // Image shouldn't difference usually
                willChange: 'transform, width, height',
                // Initial off-screen
                transform: 'translate3d(-100px, -100px, 0)',
                transition: 'width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.2s, border-radius 0.2s'
            }}
        />
    )
}
