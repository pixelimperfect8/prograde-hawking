import { useRef, useEffect } from 'react'
import { useStore } from '../../store'
import SceneControl from './SceneControl'
import GradientControl from './GradientControl'
import GlassControl from './GlassControl'
import EffectsControl from './EffectsControl'
import LavaControl from './LavaControl'
import BlobControl from './BlobControl'
import GlowControl from './GlowControl'
import OrbsControl from './OrbsControl'
import AcidBurnControl from './AcidBurnControl'
import FluidFlowControl from './FluidFlowControl'

export default function Overlay() {
    const { scene, appState } = useStore()
    const { bgMode } = scene
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
            // Lerp formula: current = current + (target - current) * factor
            const diff = targetScroll.current - currentScrollRef.current

            // Only update DOM if there's significant movement
            if (Math.abs(diff) > 0.1) {
                currentScrollRef.current += diff * 0.05
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

            const next = targetScroll.current + e.deltaY * 0.8 // 0.8 speed factor
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

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '320px', // Slick standard width
                height: '100vh',
                zIndex: 100,

                // The "Glass" Background
                background: 'rgba(5, 5, 5, 0.65)',
                backdropFilter: 'blur(50px)',
                WebkitBackdropFilter: 'blur(50px)',

                // The "Fade Away" Mask
                maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',

                display: 'flex',
                flexDirection: 'column',

                // Border/Separation
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
                // Hide overflow, we handle it manually
                overflow: 'hidden',

                // Entrance Animation
                opacity: isReady ? 1 : 0,
                transform: isReady ? 'translateX(0)' : 'translateX(100px)',
                pointerEvents: isReady ? 'auto' : 'none',
                transition: 'opacity 1s ease 0.5s, transform 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.5s', // Delay slightly after explosion
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
                    paddingBottom: '120px', // Space for fade
                    width: '100%',
                    willChange: 'transform', // Hardware accel
                    boxSizing: 'border-box' // Fix clipping
                }}
            >
                <SceneControl />

                {/* Dynamic Controls based on Background Mode */}
                {bgMode === 'Gradient' && <GradientControl />}
                {bgMode === 'Lava Lamp' && <LavaControl />}
                {bgMode === 'Blob Stack' && <BlobControl />}
                {bgMode === 'Solid + Glow' && <GlowControl />}
                {bgMode === 'Orbs' && <OrbsControl />}
                {bgMode === 'Acid Burn' && <AcidBurnControl />}
                {bgMode === 'Fluid Flow' && <FluidFlowControl />}

                <GlassControl />
                <EffectsControl />
            </div>
        </div>
    )
}
