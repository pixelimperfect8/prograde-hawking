import { useRef, useEffect, useState } from 'react'
import { useStore } from '../../store'
import SceneControl from './SceneControl'



export default function Overlay() {
    const { appState } = useStore()
    const isReady = appState === 'ready'

    // Custom Momentum Scroll Logic (Ref-based, no re-renders)
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    // Use refs instead of state for the loop
    const targetScroll = useRef(0)
    const currentScrollRef = useRef(0)

    useEffect(() => {
        let animationFrameId: number

        const loop = () => {
            if (isMobile) return // Disable on mobile
            // Lerp formula: current = current + (target - current) * factor
            const diff = targetScroll.current - currentScrollRef.current

            // Only update DOM if there's significant movement
            if (Math.abs(diff) > 0.1) {
                currentScrollRef.current += diff * 0.1 // Snappier smoothing (was 0.05)
                if (contentRef.current) {
                    contentRef.current.style.transform = `translateY(${-currentScrollRef.current}px)`
                }
            }

            animationFrameId = requestAnimationFrame(loop)
        }
        loop()
        return () => cancelAnimationFrame(animationFrameId)
    }, [])

    // No need for separate useEffect to apply scroll, done in loop

    // Handle Wheel
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            // Prevent default hard scroll
            // Note: Preventing default on wheel can be tricky with passive events, 
            // but for a fixed overlay it's usually fine if we attach non-passive.
            e.preventDefault()

            const maxScroll = (contentRef.current?.offsetHeight || 0) - (containerRef.current?.offsetHeight || 0) + 144 // + padding
            const clampedMax = Math.max(0, maxScroll)

            const next = targetScroll.current + e.deltaY * 1.2 // Faster speed (was 0.8)
            targetScroll.current = Math.max(0, Math.min(next, clampedMax))
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false })
        }
        return () => {
            if (container) container.removeEventListener('wheel', handleWheel)
        }
    }, [])

    // Mobile Check
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div
            id="ui-panel"
            style={{
                position: 'fixed',
                // Mobile: Bottom / Desktop: Right
                top: isMobile ? 'auto' : 0,
                bottom: 0,
                right: 0,
                left: isMobile ? 0 : 'auto', // Span full width on mobile

                width: isMobile ? '100vw' : '320px', // Full width vs Sidebar
                height: isMobile ? 'auto' : '100vh', // Auto height vs Full height
                maxHeight: isMobile ? '50vh' : '100vh', // Cap height on mobile

                zIndex: 100,

                // The "Glass" Background
                background: 'rgba(5, 5, 5, 0.65)',
                backdropFilter: 'blur(50px)',
                WebkitBackdropFilter: 'blur(50px)',

                // The "Fade Away" Mask (Vertical for desktop, Horizontal/None for mobile)
                maskImage: isMobile ? 'none' : 'linear-gradient(to bottom, black 70%, transparent 100%)',
                WebkitMaskImage: isMobile ? 'none' : 'linear-gradient(to bottom, black 70%, transparent 100%)',

                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',

                // Border/Separation
                borderLeft: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                borderTop: isMobile ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.5)' : '-20px 0 60px rgba(0,0,0,0.5)',

                // Scroll handling
                overflowY: isMobile ? 'hidden' : 'hidden', // Desktop handles manually, Mobile handles X
                overflowX: isMobile ? 'auto' : 'hidden', // Mobile scrolls horizontally

                // Entrance Animation
                opacity: isReady ? 1 : 0,
                transform: isReady
                    ? 'translate(0,0)'
                    : (isMobile ? 'translateY(100px)' : 'translateX(100px)'),
                pointerEvents: isReady ? 'auto' : 'none',
                transition: 'opacity 1s ease 0.5s, transform 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s',
            }}
            ref={containerRef}
        >
            <div
                ref={contentRef}
                style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column', // Horizontal stack on mobile
                    gap: '24px',
                    paddingBottom: isMobile ? '24px' : '120px',
                    paddingRight: isMobile ? '24px' : '24px',

                    width: isMobile ? 'auto' : '100%',
                    height: isMobile ? '100%' : 'auto',

                    // Kill transform on mobile (native scroll)
                    transform: isMobile ? 'none' : undefined,
                    willChange: isMobile ? 'auto' : 'transform',
                    boxSizing: 'border-box'
                }}
            >
                <SceneControl />
            </div>
        </div>
    )
}
