import { useStore } from '../../store'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'
import Section from './inputs/Section'

export default function LiquidMetalControl() {
    const { liquidMetal, setLiquidMetal } = useStore()

    const updateColor = (index: number, move: string) => {
        const newColors = [...liquidMetal.colors]
        newColors[index] = move
        setLiquidMetal({ colors: newColors })
    }

    const addColor = () => {
        if (liquidMetal.colors.length < 4) {
            setLiquidMetal({ colors: [...liquidMetal.colors, '#ffffff'] })
        }
    }

    const removeColor = () => {
        if (liquidMetal.colors.length > 1) {
            const newColors = [...liquidMetal.colors]
            newColors.pop()
            setLiquidMetal({ colors: newColors })
        }
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            <Section title="Palette">
                <div className="flex flex-col gap-3">
                    {liquidMetal.colors.map((c, i) => (
                        <ColorPicker
                            key={i}
                            label={`Color ${i + 1}`}
                            value={c}
                            onChange={(val) => updateColor(i, val)}
                        />
                    ))}

                    <div className="flex gap-2 mt-2">
                        {liquidMetal.colors.length < 4 && (
                            <button
                                onClick={addColor}
                                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white/60 transition-colors border border-white/5"
                            >
                                + Add Color
                            </button>
                        )}
                        {liquidMetal.colors.length > 1 && (
                            <button
                                onClick={removeColor}
                                className="flex-1 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors border border-red-500/10"
                            >
                                - Remove
                            </button>
                        )}
                    </div>
                </div>
            </Section>

            <Section title="Simulation">
                <div className="flex flex-col gap-4">
                    <Slider
                        label="Zoom / Scale"
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
                </div>
            </Section>

            <Section title="Warping">
                <div className="flex flex-col gap-4">
                    <Slider
                        label="Fluid Warp"
                        value={liquidMetal.metalness}
                        min={0}
                        max={20}
                        step={0.1}
                        onChange={(val) => setLiquidMetal({ metalness: val })}
                    />
                    <Slider
                        label="Detail Swirls"
                        value={liquidMetal.roughness}
                        min={0}
                        max={2.0}
                        step={0.01}
                        onChange={(val) => setLiquidMetal({ roughness: val })}
                    />
                </div>
            </Section>
        </div>
    )
}
