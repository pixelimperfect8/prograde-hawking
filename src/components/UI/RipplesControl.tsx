import { useStore } from '../../store'
import Select from './inputs/Select'
import Section from './inputs/Section'
import Slider from './inputs/Slider'


export default function RipplesControl() {
    const { ripples, setRipples } = useStore()

    return (
        <Section title="Mode Settings">
            <Select
                label="Animation"
                value={ripples.effectType || 'Expand'}
                options={['Static', 'Pulse', 'Expand']}
                onChange={(v) => setRipples({ effectType: v as any })}
            />
            <Slider
                label="Cell Density"
                value={ripples.cellDensity}
                min={10}
                max={400}
                step={1}
                onChange={(v) => setRipples({ cellDensity: v })}
            />
            <Slider
                label="Spread"
                value={ripples.spread}
                min={0.05}
                max={0.5}
                step={0.01}
                onChange={(v) => setRipples({ spread: v })}
            />
        </Section>
    )
}
