import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
    // Mobile Drawer State
    const [isMobile, setIsMobile] = useState(false)
    const [isOpen, setIsOpen] = useState(true)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Drawer Animations
    const drawerVariants = {
        open: { y: 0 },
        closed: { y: '85%' }
    }

    const onDragEnd = (_: any, info: any) => {
        const offset = info.offset.y
        const velocity = info.velocity.y
        if (offset > 100 || velocity > 200) setIsOpen(false)
        else if (offset < -100 || velocity < -200) setIsOpen(true)
    }

    return (
        <>
            {/* Desktop Overlay */}
            {!isMobile && (
                <div
                    id="ui-panel"
                    style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        width: '320px',
                        height: '100vh',
                        zIndex: 100,
                        background: 'rgba(5, 5, 5, 0.65)',
                        backdropFilter: 'blur(50px)',
                        WebkitBackdropFilter: 'blur(50px)',
                        maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        opacity: isReady ? 1 : 0,
                        transform: isReady ? 'translateX(0)' : 'translateX(100px)',
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
                            flexDirection: 'column',
                            gap: '24px',
                            paddingBottom: '120px',
                            width: '100%',
                            willChange: 'transform',
                            boxSizing: 'border-box'
                        }}
                    >
                        <SceneControl />
                    </div>
                </div>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
                <motion.div
                    initial="open"
                    animate={isOpen ? 'open' : 'closed'}
                    variants={drawerVariants}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={onDragEnd}
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        width: '100vw',
                        height: '35vh', // Reduced from 75vh (approx 30-35% of screen)
                        zIndex: 100,
                        background: 'rgba(10, 10, 10, 0.9)',
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        opacity: isReady ? 1 : 0,
                        pointerEvents: isReady ? 'auto' : 'none',
                        touchAction: 'none' // Important for drag
                    }}
                >
                    {/* Drag Handle Area */}
                    <div
                        style={{
                            width: '100%',
                            height: '40px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexShrink: 0
                        }}
                    >
                        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
                    </div>

                    {/* Content Area */}
                    <div
                        style={{
                            padding: '24px',
                            paddingTop: '0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                            overflowY: 'auto',
                            flex: 1,
                            paddingBottom: 'safe-area-inset-bottom',
                            // Allow scroll inside drag container by stopping propagation?
                            // No, framer motion handles this if we use dragControls or set touchAction correctly?
                            // Actually 'touchAction: none' on parent disables browser scroll.
                            // We need native scroll for content.
                            // Solution: touchAction: 'pan-y' on content?
                        }}
                        onPointerDown={(e) => e.stopPropagation()} // Stop drag initiation on content
                    >
                        <style>{`
                            .drawer-content { touch-action: pan-y; }
                        `}</style>
                        <div className="drawer-content">
                            <SceneControl />
                        </div>
                        {/* Spacer for bottom safe area */}
                        <div style={{ height: '80px', flexShrink: 0 }} />
                    </div>
                </motion.div>
            )}
        </>
    )
}
