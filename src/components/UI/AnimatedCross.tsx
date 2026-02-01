import { useState, useEffect } from 'react'

export default function AnimatedCross({ size = 118 }: { size?: number }) {
    const [currentFrame, setCurrentFrame] = useState(1)
    useEffect(() => {
        // Cycle 1 -> 2 -> 3
        const interval = setInterval(() => setCurrentFrame((prev) => (prev % 3) + 1), 150)
        return () => clearInterval(interval)
    }, [])
    return (
        <img
            src={`/crosses/${currentFrame}.png`}
            alt="Loading"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                imageRendering: '-webkit-optimize-contrast',
                WebkitFontSmoothing: 'antialiased',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
            }}
        />
    )
}
