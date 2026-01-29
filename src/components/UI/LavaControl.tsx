import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'

export default function LavaControl() {
    const { lava, setLava } = useStore()

    return (
        <Section title="Mode Settings">
            <Slider label="Threshold" value={lava.threshold} min={0} max={2} onChange={(v) => setLava({ threshold: v })} />
        </Section>
    )
}
