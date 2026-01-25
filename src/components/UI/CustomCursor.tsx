import { useEffect, useState } from 'react'

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Glitch Effect Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.9) { // 10% chance to glitch
                setGlitchOffset({
                    x: (Math.random() - 0.5) * 10,
                    y: (Math.random() - 0.5) * 10
                })
                setTimeout(() => setGlitchOffset({ x: 0, y: 0 }), 50)
            }
        }, 100)
        return () => clearInterval(interval)
    }, [])

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9999,
                overflow: 'hidden'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: position.y + glitchOffset.y,
                    left: position.x + glitchOffset.x,
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#FBFF00', // Yellow
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    mixBlendMode: 'difference', // Cool blend
                    // boxShadow removed
                }}
            />
        </div>
    )
}
