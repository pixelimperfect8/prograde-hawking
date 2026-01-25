import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function LavaControl() {
    const { lava, setLava } = useStore()

    return (
        <Section title="Lava Settings">
            <ColorPicker label="Color 1" value={lava.color1} onChange={(v) => setLava({ color1: v })} />
            <ColorPicker label="Color 2" value={lava.color2} onChange={(v) => setLava({ color2: v })} />
            <ColorPicker label="Color 3" value={lava.color3} onChange={(v) => setLava({ color3: v })} />

            <Slider label="Speed" value={lava.speed} min={0} max={2} onChange={(v) => setLava({ speed: v })} />
            <Slider label="Threshold" value={lava.threshold} min={0} max={2} onChange={(v) => setLava({ threshold: v })} />
        </Section>
    )
}
