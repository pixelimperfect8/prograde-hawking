import { useStore } from '../../store'
import Slider from './inputs/Slider'
import Section from './inputs/Section'

export default function AcidTripControl() {
    const { fluid, setFluid } = useStore()
    const { density, strength, smoothing, complexity } = fluid

    return (
        <Section title="Mode Settings">
            <Slider label="Noise Density" value={density} min={0.2} max={2.0} onChange={(v) => setFluid({ density: v })} />
            <Slider label="Warp Strength" value={strength} min={0.0} max={1.0} onChange={(v) => setFluid({ strength: v })} />
            <Slider label="Swirl Complexity" value={complexity} min={0.1} max={2.0} onChange={(v) => setFluid({ complexity: v })} />
            <Slider label="Smoothing" value={smoothing} min={0.0} max={2.0} onChange={(v) => setFluid({ smoothing: v })} />
        </Section>
    )
}
