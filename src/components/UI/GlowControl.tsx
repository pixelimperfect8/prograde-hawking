import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function GlowControl() {
    const { glow, setGlow } = useStore()

    return (
        <Section title="Glow Settings">
            <ColorPicker label="Color 1" value={glow.color1} onChange={(v) => setGlow({ color1: v })} />
            <ColorPicker label="Color 2" value={glow.color2} onChange={(v) => setGlow({ color2: v })} />

            <Slider label="Radius 1" value={glow.radius1} min={0} max={2} onChange={(v) => setGlow({ radius1: v })} />
            <Slider label="Radius 2" value={glow.radius2} min={0} max={2} onChange={(v) => setGlow({ radius2: v })} />
            <Slider label="Intensity" value={glow.intensity} min={0} max={3} onChange={(v) => setGlow({ intensity: v })} />
            <Slider label="Pulse Speed" value={glow.pulseSpeed} min={0} max={5} onChange={(v) => setGlow({ pulseSpeed: v })} />
        </Section>
    )
}
