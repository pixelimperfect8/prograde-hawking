import { useStore } from '../../store'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'
import Section from './inputs/Section'

export default function CubicGlassControl() {
    const { cubicGlass, setCubicGlass } = useStore()

    const updateColor = (index: number, move: string) => {
        const newColors = [...cubicGlass.colors]
        newColors[index] = move
        setCubicGlass({ colors: newColors })
    }

    const addColor = () => {
        if (cubicGlass.colors.length < 5) {
            setCubicGlass({ colors: [...cubicGlass.colors, '#ffffff'] })
        }
    }

    const removeColor = () => {
        if (cubicGlass.colors.length > 1) {
            const newColors = [...cubicGlass.colors]
            newColors.pop()
            setCubicGlass({ colors: newColors })
        }
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <Section title="Palette">
                <div className="flex flex-col gap-3">
                    {cubicGlass.colors.map((c, i) => (
                        <ColorPicker
                            key={i}
                            label={`Color ${i + 1}`}
                            value={c}
                            onChange={(val) => updateColor(i, val)}
                        />
                    ))}

                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                        <button
                            onClick={addColor}
                            disabled={cubicGlass.colors.length >= 5}
                            className="flex-1 py-2 px-4 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] uppercase tracking-wider font-medium text-white transition-all border border-white/5 hover:border-white/20"
                        >
                            + Add Color
                        </button>
                        <button
                            onClick={removeColor}
                            disabled={cubicGlass.colors.length <= 1}
                            className="flex-1 py-2 px-4 rounded-md bg-white/5 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] uppercase tracking-wider font-medium text-white hover:text-red-200 transition-all border border-white/5 hover:border-red-500/20"
                        >
                            - Remove
                        </button>
                    </div>
                </div>
            </Section>

            <Section title="Grid">
                <Slider
                    label="Block Density"
                    value={cubicGlass.gridSize}
                    min={5}
                    max={100}
                    step={1}
                    onChange={(val) => setCubicGlass({ gridSize: val })}
                />
            </Section>

            <Section title="Motion">
                <div className="flex flex-col gap-4">
                    <Slider
                        label="Speed"
                        value={cubicGlass.speed}
                        min={0}
                        max={2.0}
                        step={0.01}
                        onChange={(val) => setCubicGlass({ speed: val })}
                    />
                    <Slider
                        label="Smoothness"
                        value={cubicGlass.smoothness}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={(val) => setCubicGlass({ smoothness: val })}
                    />
                </div>
            </Section>
        </div>
    )
}
