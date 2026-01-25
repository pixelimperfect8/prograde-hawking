import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function OrbsControl() {
    const { orbs, setOrbs } = useStore()

    return (
        <Section title="Orbs">
            <ColorPicker label="Orb 1" value={orbs.color1} onChange={(v) => setOrbs({ color1: v })} />
            <ColorPicker label="Orb 2" value={orbs.color2} onChange={(v) => setOrbs({ color2: v })} />
            <ColorPicker label="Orb 3" value={orbs.color3} onChange={(v) => setOrbs({ color3: v })} />
            <ColorPicker label="Orb 4" value={orbs.color4} onChange={(v) => setOrbs({ color4: v })} />

            <Slider label="Speed" value={orbs.speed} min={0.1} max={1} onChange={(v) => setOrbs({ speed: v })} />
            <Slider label="Blur" value={orbs.blur} min={0.1} max={1} onChange={(v) => setOrbs({ blur: v })} />
            <Slider label="Scale" value={orbs.scale} min={0.5} max={2} onChange={(v) => setOrbs({ scale: v })} />
        </Section>
    )
}
