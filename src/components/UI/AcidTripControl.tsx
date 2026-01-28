import { useStore } from '../../store'
import ColorPicker from './inputs/ColorPicker'
import Slider from './inputs/Slider'
import Section from './inputs/Section'

export default function AcidTripControl() {
    const { fluid, setFluid } = useStore()
    const { color1, color2, color3, color4, background, speed, density, strength, smoothing, complexity } = fluid

    return (
        <Section title="Acid Trip Settings">
            <ColorPicker label="Background" value={background} onChange={(c) => setFluid({ background: c })} />
            <ColorPicker label="Color 1" value={color1} onChange={(c) => setFluid({ color1: c })} />
            <ColorPicker label="Color 2" value={color2} onChange={(c) => setFluid({ color2: c })} />
            <ColorPicker label="Color 3" value={color3} onChange={(c) => setFluid({ color3: c })} />
            <ColorPicker label="Color 4" value={color4} onChange={(c) => setFluid({ color4: c })} />

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />

            <Slider label="Flow Speed" value={speed} min={0.0} max={1.0} onChange={(v) => setFluid({ speed: v })} />
            <Slider label="Noise Density" value={density} min={0.2} max={2.0} onChange={(v) => setFluid({ density: v })} />
            <Slider label="Warp Strength" value={strength} min={0.0} max={1.0} onChange={(v) => setFluid({ strength: v })} />
            <Slider label="Swirl Complexity" value={complexity} min={0.1} max={2.0} onChange={(v) => setFluid({ complexity: v })} />
            <Slider label="Smoothing" value={smoothing} min={0.0} max={2.0} onChange={(v) => setFluid({ smoothing: v })} />
        </Section>
    )
}
