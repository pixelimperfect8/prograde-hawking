import { useRef, useState, useEffect } from 'react'
import { useStore } from '../../store'
import SceneControl from './SceneControl'
import GradientControl from './GradientControl'
import GlassControl from './GlassControl'
import EffectsControl from './EffectsControl'
import LavaControl from './LavaControl'
import BlobControl from './BlobControl'
import GlowControl from './GlowControl'

export default function Overlay() {
    const { scene } = useStore()
    const { bgMode } = scene

    // Custom Momentum Scroll Logic
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [templateScroll, setTemplateScroll] = useState(0) // target scroll
    const [currentScroll, setCurrentScroll] = useState(0) // actual scroll (lerped)

    useEffect(() => {
        let animationFrameId: number

        const loop = () => {
            // Lerp formula: current = current + (target - current) * factor
            // 0.08 factor for that "heavy" smooth feel
            setCurrentScroll(prev => {
                const diff = templateScroll - prev
                if (Math.abs(diff) < 0.5) return templateScroll
                return prev + diff * 0.05
            })
            animationFrameId = requestAnimationFrame(loop)
        }
        loop()
        return () => cancelAnimationFrame(animationFrameId)
    }, [templateScroll])

    // Apply scroll to element
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.transform = `translateY(${-currentScroll}px)`
        }
    }, [currentScroll])

    // Handle Wheel
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            // Prevent default hard scroll
            // Note: Preventing default on wheel can be tricky with passive events, 
            // but for a fixed overlay it's usually fine if we attach non-passive.
            e.preventDefault()

            const maxScroll = (contentRef.current?.offsetHeight || 0) - (containerRef.current?.offsetHeight || 0) + 144 // + padding
            const clampedMax = Math.max(0, maxScroll)

            setTemplateScroll(prev => {
                const next = prev + e.deltaY * 0.8 // 0.8 speed factor
                return Math.max(0, Math.min(next, clampedMax))
            })
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
                overflow: 'hidden'
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

                <GlassControl />
                <EffectsControl />
            </div>
        </div>
    )
}
