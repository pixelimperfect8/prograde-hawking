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

    const sortedStops = [...stops].sort((a, b) => a.pos - b.pos)

    return (
        <Section title="Linear Gradient Settings">
            <GradientBar
                stops={stops}
                onChange={(id, pos) => updateStop(id, { pos })}
                onSelect={setSelectedId}
                selectedId={selectedId}
            />

            <div className="flex justify-between items-center mt-2 mb-2">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wide">Stops</span>
                <button
                    onClick={addStop}
                    className="text-white hover:text-white/80 text-sm font-medium transition-colors"
                >
                    + Add
                </button>
            </div>

            <div className="flex flex-col gap-1">
                {sortedStops.map((stop) => {
                    const isSel = selectedId === stop.id
                    return (
                        <div
                            key={stop.id}
                            onClick={() => setSelectedId(stop.id)}
                            className={`flex items-center gap-2 p-1 rounded transition-colors border ${isSel ? 'bg-blue-500/20 border-blue-500/50' : 'border-transparent hover:bg-white/5'}`}
                        >
                            {/* Position Input */}
                            <div className="w-[50px] flex items-center bg-black/20 rounded p-0.5">
                                <input
                                    type="number"
                                    value={Math.round(stop.pos * 100)}
                                    onChange={(e) => {
                                        const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                                        updateStop(stop.id, { pos: val / 100 })
                                    }}
                                    className="w-full bg-transparent border-none text-white text-right text-[11px] focus:outline-none"
                                />
                                <span className="text-[10px] text-gray-400 ml-0.5">%</span>
                            </div>

                            {/* Color Swatch/Picker */}
                            <div className="flex-1 flex items-center">
                                <input
                                    type="color"
                                    value={stop.color}
                                    onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                                    className="w-full h-6 border-none bg-transparent cursor-pointer"
                                />
                                <span className="text-[10px] text-gray-400 ml-1 font-mono">{stop.color.toUpperCase()}</span>
                            </div>

                            {/* Opacity Input */}
                            <div className="w-[50px] flex items-center bg-black/20 rounded p-0.5">
                                <input
                                    type="number"
                                    value={Math.round((stop.opacity ?? 1) * 100)}
                                    onChange={(e) => {
                                        const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                                        updateStop(stop.id, { opacity: val / 100 })
                                    }}
                                    className="w-full bg-transparent border-none text-white text-right text-[11px] focus:outline-none"
                                />
                                <span className="text-[10px] text-gray-400 ml-0.5">%</span>
                            </div>

                            {/* Remove */}
                            <button
                                onClick={(e) => { e.stopPropagation(); removeStop(stop.id); }}
                                disabled={stops.length <= 2}
                                className={`text-sm px-2 ${stops.length <= 2 ? 'text-white/10 cursor-not-allowed' : 'text-white/60 hover:text-red-400 cursor-pointer'}`}
                            >
                                –
                            </button>
                        </div>
                    )
                })}
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '16px 0 16px 0' }} />

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
    )
}
