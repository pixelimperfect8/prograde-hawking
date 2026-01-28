import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function OrbsControl() {
    const { orbs, setOrbs, randomizeColors } = useStore()

    return (
        <Section title="Orbs Settings">
            <button
                onClick={randomizeColors}
                className="w-full py-2 mb-4 rounded-md bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-wider font-medium text-white transition-all border border-white/5 hover:border-white/20"
            >
                🎲 Randomize Colors
            </button>

            <ColorPicker label="Orb 1" value={orbs.color1} onChange={(v) => setOrbs({ color1: v })} />
            <ColorPicker label="Orb 2" value={orbs.color2} onChange={(v) => setOrbs({ color2: v })} />
            <ColorPicker label="Orb 3" value={orbs.color3} onChange={(v) => setOrbs({ color3: v })} />
            <ColorPicker label="Orb 4" value={orbs.color4} onChange={(v) => setOrbs({ color4: v })} />

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0 16px 0' }} />

            <Slider label="Speed" value={orbs.speed} min={0.1} max={1} onChange={(v) => setOrbs({ speed: v })} />
            <Slider label="Blur" value={orbs.blur} min={0.1} max={1} onChange={(v) => setOrbs({ blur: v })} />
            <Slider label="Scale" value={orbs.scale} min={0.5} max={2} onChange={(v) => setOrbs({ scale: v })} />
        </Section>
    )
}
