import { useStore } from '../../store'
import Select from './inputs/Select'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function RipplesControl() {
    const { ripples, setRipples } = useStore()

    return (
        <div className="flex flex-col gap-0">
            <Section title="Palette">
                <div className="flex flex-col gap-4">
                    <ColorPicker
                        label="Base Color"
                        value={ripples.color}
                        onChange={(v) => setRipples({ color: v })}
                    />
                    <ColorPicker
                        label="Background"
                        value={ripples.backgroundColor || '#000000'}
                        onChange={(v) => setRipples({ backgroundColor: v })}
                    />
                </div>
            </Section>

            <Section title="Simulation">
                <div className="flex flex-col gap-4">
                    <Select
                        label="Animation"
                        value={ripples.effectType || 'Expand'}
                        options={['Static', 'Pulse', 'Expand']}
                        onChange={(v) => setRipples({ effectType: v as any })}
                    />
                    <Slider
                        label="Speed"
                        value={ripples.speed}
                        min={0}
                        max={2.0}
                        step={0.01}
                        onChange={(v) => setRipples({ speed: v })}
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
                </div>
            </Section>
        </div>
    )
}
