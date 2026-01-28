import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function LavaControl() {
    const { lava, setLava, randomizeColors } = useStore()

    return (
        <div className="flex flex-col gap-0">
            <Section title="Palette">
                <div className="flex flex-col gap-3">
                    <button
                        onClick={randomizeColors}
                        className="w-full py-2 mb-2 rounded-md bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-wider font-medium text-white transition-all border border-white/5 hover:border-white/20"
                    >
                        🎲 Randomize Colors
                    </button>

                    <ColorPicker label="Background" value={lava.background} onChange={(v) => setLava({ background: v })} />
                    <ColorPicker label="Color 1" value={lava.color1} onChange={(v) => setLava({ color1: v })} />
                    <ColorPicker label="Color 2" value={lava.color2} onChange={(v) => setLava({ color2: v })} />
                    <ColorPicker label="Color 3" value={lava.color3} onChange={(v) => setLava({ color3: v })} />
                </div>
            </Section>

            <Section title="Simulation">
                <div className="flex flex-col gap-4">
                    <Slider label="Speed" value={lava.speed} min={0} max={2} onChange={(v) => setLava({ speed: v })} />
                    <Slider label="Threshold" value={lava.threshold} min={0} max={2} onChange={(v) => setLava({ threshold: v })} />
                </div>
            </Section>
        </div>
    )
}
