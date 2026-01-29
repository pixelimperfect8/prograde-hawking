import { useState } from 'react'
import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import Select from './inputs/Select'
import GradientBar from './inputs/GradientBar'
import GradientStopRow from './inputs/GradientStopRow'

// Simple ID gen if UUID not available in environment
const generateId = () => Math.random().toString(36).substr(2, 9)

export default function AdvancedGradientControl() {
    const { advancedGradient, setAdvancedGradient } = useStore()
    const { stops, angle, animation } = advancedGradient

    const [selectedId, setSelectedId] = useState<string | null>(stops[0]?.id || null)

    const updateStop = (id: string, partial: Partial<{ color: string, pos: number, opacity: number }>) => {
        const newStops = stops.map(s => s.id === id ? { ...s, ...partial } : s)
        setAdvancedGradient({ stops: newStops })
    }

    const addStop = () => {
        if (stops.length >= 10) return

        // Smart Placement
        const sorted = [...stops].sort((a, b) => a.pos - b.pos)
        let newPos = 0.5
        // Try to place in largest gap
        let maxGap = 0;
        let gapStart = 0;

        if (sorted.length > 0) {
            if (sorted[0].pos > maxGap) { maxGap = sorted[0].pos; gapStart = 0; }
            for (let i = 0; i < sorted.length - 1; i++) {
                const gap = sorted[i + 1].pos - sorted[i].pos
                if (gap > maxGap) {
                    maxGap = gap;
                    gapStart = sorted[i].pos;
                }
            }
            if (1.0 - sorted[sorted.length - 1].pos > maxGap) {
                maxGap = 1.0 - sorted[sorted.length - 1].pos;
                gapStart = sorted[sorted.length - 1].pos;
            }
            newPos = gapStart + maxGap / 2;
        }

        const newStop = {
            id: generateId(),
            color: '#ffffff',
            pos: newPos,
            opacity: 1.0
        }

        setAdvancedGradient({ stops: [...stops, newStop] })
        setSelectedId(newStop.id)
    }

    const removeStop = (id: string) => {
        if (stops.length <= 2) return
        setAdvancedGradient({ stops: stops.filter(s => s.id !== id) })
        if (selectedId === id) setSelectedId(null)
    }

    const sortedStops = [...stops].sort((a, b) => a.pos - b.pos)

    return (
        <Section title="Linear Gradient Settings">
            <GradientBar
                stops={stops}
                onChange={(id, pos) => updateStop(id, { pos })}
                onSelect={setSelectedId}
                selectedId={selectedId}
            />

            {/* Stops Header & Add Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Stops</span>
                <button
                    onClick={addStop}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '9px',
                        padding: '4px 8px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                >
                    + Add
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                {sortedStops.map((stop) => (
                    <GradientStopRow
                        key={stop.id}
                        id={stop.id}
                        color={stop.color}
                        pos={stop.pos}
                        opacity={stop.opacity}
                        selected={selectedId === stop.id}
                        onSelect={() => setSelectedId(stop.id)}
                        onChange={(partial) => updateStop(stop.id, partial)}
                        onRemove={() => removeStop(stop.id)}
                        canRemove={stops.length > 2}
                    />
                ))}
            </div>

            <Slider
                label="Angle"
                value={angle}
                min={0}
                max={360}
                step={1}
                onChange={(val) => setAdvancedGradient({ angle: val })}
            />

            <Select
                label="Animation"
                value={animation}
                options={['Static', 'Flow', 'Pulse']}
                onChange={(val) => setAdvancedGradient({ animation: val as any })}
            />

            {animation !== 'Static' && (
                <Slider
                    label="Animation Speed"
                    value={advancedGradient.speed}
                    min={0}
                    max={5}
                    step={0.1}
                    onChange={(val) => setAdvancedGradient({ speed: val })}
                />
            )}
        </Section>
    )
}
