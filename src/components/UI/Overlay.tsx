import { useState, useRef } from 'react'
import SceneControl from './SceneControl'
import GradientControl from './GradientControl'
import GlassControl from './GlassControl'
import EffectsControl from './EffectsControl'

export default function Overlay() {
    const [position, setPosition] = useState({ x: 24, y: 24 })
    const isDragging = useRef(false)
    const dragOffset = useRef({ x: 0, y: 0 })

    const handlePointerDown = (e: React.PointerEvent) => {
        // Prevent dragging when interacting with inputs
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'SELECT') return

        isDragging.current = true
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        }
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current) return
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y
        })
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        isDragging.current = false
        e.currentTarget.releasePointerCapture(e.pointerId)
    }

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{
                position: 'absolute',
                top: position.y,
                left: position.x,
                width: '337px',
                // maxHeight: 'calc(100vh - 48px)', // Let it flow, use body scroll if needed or internal
                maxHeight: '90vh',

                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '0px', // Padding is now inside sections

                background: 'transparent',
                borderRadius: '0px',

                overflowY: 'auto',
                zIndex: 100,
                cursor: 'grab',
                touchAction: 'none'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'default' }} onPointerDown={(e) => e.stopPropagation()}>
                {/* <BrandingControl /> */}
                <SceneControl />
                <GradientControl />
                <GlassControl />
                <EffectsControl />
            </div>
        </div>
    )
}
