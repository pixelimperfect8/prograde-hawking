import React from 'react'
import { useStore } from '../../store'


interface SliderProps {
    label: string
    value: number
    min: number
    max: number
    step: number
    onChange: (val: number) => void
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange }) => (
    <div className="mb-4">
        <label className="block text-xs font-medium text-white/60 mb-1 font-mono uppercase tracking-wider">
            {label} <span className="text-white/40 ml-1">[{value.toFixed(2)}]</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
        />
    </div>
)

export default function LiquidMetalControl() {
    const { liquidMetal, setLiquidMetal } = useStore()

    const updateColor = (index: number, move: string) => {
        const newColors = [...liquidMetal.colors]
        newColors[index] = move
        setLiquidMetal({ colors: newColors })
    }

    return (
        <div className="p-4 space-y-6">
            <div>
                <label className="block text-xs font-medium text-white/60 mb-2 font-mono uppercase tracking-wider">
                    Palette
                </label>
                <div className="flex flex-wrap gap-2">
                    {liquidMetal.colors.map((c, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <input
                                type="color"
                                value={c}
                                onChange={(e) => updateColor(i, e.target.value)}
                                className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                            />
                        </div>
                    ))}
                    {liquidMetal.colors.length < 4 && (
                        <button
                            onClick={() => setLiquidMetal({ colors: [...liquidMetal.colors, '#ffffff'] })}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
                        >
                            +
                        </button>
                    )}
                    {liquidMetal.colors.length > 1 && (
                        <button
                            onClick={() => {
                                const newColors = [...liquidMetal.colors]
                                newColors.pop()
                                setLiquidMetal({ colors: newColors })
                            }}
                            className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-200 text-xs"
                        >
                            -
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <Slider
                    label="Noise Scale"
                    value={liquidMetal.distortion}
                    min={0.1}
                    max={4.0}
                    step={0.1}
                    onChange={(val) => setLiquidMetal({ distortion: val })}
                />
                <Slider
                    label="Flow Speed"
                    value={liquidMetal.speed}
                    min={0}
                    max={1.0}
                    step={0.01}
                    onChange={(val) => setLiquidMetal({ speed: val })}
                />
                <Slider
                    label="Warp Strength"
                    value={liquidMetal.metalness} // Mapping Metalness to Warp Amount A
                    min={0}
                    max={20}
                    step={0.1}
                    onChange={(val) => setLiquidMetal({ metalness: val })}
                />
                <Slider
                    label="Detail Warp"
                    value={liquidMetal.roughness} // Mapping Roughness to Warp Amount B
                    min={0}
                    max={2.0}
                    step={0.01}
                    onChange={(val) => setLiquidMetal({ roughness: val })}
                />
            </div>
        </div>
    )
}
