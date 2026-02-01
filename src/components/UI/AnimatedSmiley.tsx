import { useState, useEffect } from 'react'

export default function AnimatedSmiley({ size = 118 }: { size?: number }) {
    const [currentSmiley, setCurrentSmiley] = useState(1)
    useEffect(() => {
        const interval = setInterval(() => setCurrentSmiley((prev) => (prev % 5) + 1), 150)
        return () => clearInterval(interval)
    }, [])
    return (
        <img
            src={`/smileys/${currentSmiley}.png`}
            alt="Smiley"
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
