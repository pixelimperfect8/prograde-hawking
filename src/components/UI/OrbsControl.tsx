import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'

export default function OrbsControl() {
    const { orbs, setOrbs } = useStore()

    return (
        <Section title="Mode Settings">
            <Slider label="Blur" value={orbs.blur} min={0.1} max={1} onChange={(v) => setOrbs({ blur: v })} />
            <Slider label="Scale" value={orbs.scale} min={0.5} max={2} onChange={(v) => setOrbs({ scale: v })} />
        </Section>
    )
}
