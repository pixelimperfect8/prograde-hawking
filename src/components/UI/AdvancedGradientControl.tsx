import { useState } from 'react'
import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import Select from './inputs/Select'
import GradientBar from './inputs/GradientBar'

// Simple ID gen if UUID not available in environment
const generateId = () => Math.random().toString(36).substr(2, 9)

export default function AdvancedGradientControl() {
    const { advancedGradient, setAdvancedGradient } = useStore()
    const { stops, angle, animation, speed, roughness } = advancedGradient

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

    // Sort logic for list display only? Or just render in random order?
    // User screenshot implies sorted list by position usually.
    // Let's sort list by position for display.
    const sortedStops = [...stops].sort((a, b) => a.pos - b.pos)

    return (
        <>
            <div style={{ marginBottom: '20px', padding: '0 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ width: '100px' }}>
                        <Select
                            label=""
                            value={'Linear'}
                            options={['Linear']}
                            onChange={() => { }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Fake Swap/Rotate icons for visual parity if requested, or functional? */}
                        <button
                            onClick={() => setAdvancedGradient({ angle: (angle + 45) % 360 })}
                            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            ↻
                        </button>
                    </div>
                </div>

                <GradientBar
                    stops={stops}
                    onChange={(id, pos) => updateStop(id, { pos })}
                    onSelect={setSelectedId}
                    selectedId={selectedId}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Stops</span>
                    <button onClick={addStop} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' }}>+ Add</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sortedStops.map((stop) => {
                        const isSel = selectedId === stop.id
                        return (
                            <div
                                key={stop.id}
                                onClick={() => setSelectedId(stop.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    background: isSel ? 'rgba(0,153,255,0.2)' : 'transparent',
                                    border: isSel ? '1px solid rgba(0,153,255,0.5)' : '1px solid transparent'
                                }}
                            >
                                {/* Position Input */}
                                <div style={{ width: '50px', display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', padding: '2px' }}>
                                    <input
                                        type="number"
                                        value={Math.round(stop.pos * 100)}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                                            updateStop(stop.id, { pos: val / 100 })
                                        }}
                                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', textAlign: 'right', fontSize: '11px' }}
                                    />
                                    <span style={{ fontSize: '10px', color: '#888', marginLeft: '2px' }}>%</span>
                                </div>

                                {/* Color Swatch/Picker */}
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="color"
                                        value={stop.color}
                                        onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                                        style={{
                                            width: '100%',
                                            height: '24px',
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <span style={{ fontSize: '10px', marginLeft: '4px', color: '#aaa' }}>{stop.color.toUpperCase()}</span>
                                </div>

                                {/* Opacity Input */}
                                <div style={{ width: '50px', display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', padding: '2px' }}>
                                    <input
                                        type="number"
                                        value={Math.round((stop.opacity ?? 1) * 100)}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                                            updateStop(stop.id, { opacity: val / 100 })
                                        }}
                                        style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', textAlign: 'right', fontSize: '11px' }}
                                    />
                                    <span style={{ fontSize: '10px', color: '#888', marginLeft: '2px' }}>%</span>
                                </div>

                                {/* Remove */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeStop(stop.id); }}
                                    disabled={stops.length <= 2}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: stops.length <= 2 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                                        cursor: stops.length <= 2 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    –
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Section title="Effects">
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
                        label="Speed"
                        value={speed}
                        min={0}
                        max={2}
                        step={0.05}
                        onChange={(val) => setAdvancedGradient({ speed: val })}
                    />
                )}

                <Slider
                    label="Frosted"
                    value={roughness}
                    min={0}
                    max={0.5}
                    step={0.01}
                    onChange={(val) => setAdvancedGradient({ roughness: val })}
                />

            </Section>
        </>
    )
}
