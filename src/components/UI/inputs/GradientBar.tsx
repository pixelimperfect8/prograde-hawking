import { useRef } from 'react'
import { useGesture } from '@use-gesture/react'

interface Stop {
    id: string
    color: string
    pos: number
    opacity: number
}

interface GradientBarProps {
    stops: Stop[]
    onChange: (id: string, newPos: number) => void
    onSelect: (id: string) => void
    selectedId: string | null
}

export default function GradientBar({ stops, onChange, onSelect, selectedId }: GradientBarProps) {
    const barRef = useRef<HTMLDivElement>(null)

    // Construct CSS gradient for preview
    // Ensure sorted for CSS
    const sortedStops = [...stops].sort((a, b) => a.pos - b.pos)
    const gradientString = `linear-gradient(to right, ${sortedStops.map(s => {
        // approximate opacity in CSS? 
        // We have hex colors. toRGBA helper needed?
        // Let's just use Hex for preview for now, maybe simple opacity fallback
        // Or leave opaque for simplicity in preview bar unless we want to show checkerboard
        return `${s.color} ${Math.round(s.pos * 100)}%`
    }).join(', ')})`

    return (
        <div
            ref={barRef}
            style={{
                width: '100%',
                height: '24px',
                borderRadius: '4px',
                background: gradientString,
                position: 'relative',
                marginBottom: '20px',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer' // Click empty area to add? Maybe later
            }}
            onClick={(e) => {
                // Potential "Add Stop on Click" logic could go here
                if (e.target === barRef.current) {
                    // Calculate pos and call onAdd if we supported it directly
                }
            }}
        >
            {/* Render Stops */}
            {stops.map(stop => (
                <Handle
                    key={stop.id}
                    stop={stop}
                    containerRef={barRef}
                    onChange={onChange}
                    onSelect={onSelect}
                    isSelected={selectedId === stop.id}
                />
            ))}
        </div>
    )
}

function Handle({ stop, containerRef, onChange, onSelect, isSelected }: {
    stop: Stop,
    containerRef: React.RefObject<HTMLDivElement | null>,
    onChange: (id: string, pos: number) => void,
    onSelect: (id: string) => void,
    isSelected: boolean
}) {
    const bind = useGesture({
        onDrag: ({ xy: [x], event }) => {
            // event might be synthesized, assume standard event if present
            if (event && 'stopPropagation' in event) (event as any).stopPropagation()

            if (!containerRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            const relativeX = x - rect.left
            const newPos = Math.max(0, Math.min(1, relativeX / rect.width))

            onChange(stop.id, newPos)
            onSelect(stop.id) // Auto-select on drag
        },
        onClick: ({ event }) => {
            if (event && 'stopPropagation' in event) (event as any).stopPropagation()
            onSelect(stop.id)
        }
    })

    return (
        <div
            {...bind()}
            style={{
                position: 'absolute',
                left: `${stop.pos * 100}%`,
                top: '-4px', // Overlap top slightly? or center?
                // Visual design: Screenshot has square handles slightly above/overlapping
                transform: 'translateX(-50%)',
                width: '12px',
                height: '32px', // Taller handle
                display: 'flex',
                alignItems: 'flex-end',
                cursor: 'grab',
                touchAction: 'none',
                zIndex: isSelected ? 10 : 1
            }}
        >
            {/* The Visible Handle Box */}
            <div style={{
                width: '12px',
                height: '12px',
                background: stop.color,
                border: isSelected ? '2px solid #0099ff' : '2px solid white',
                borderRadius: '2px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }} />

            {/* Triangular pointer below? Or just simple box logic */}
        </div>
    )
}
