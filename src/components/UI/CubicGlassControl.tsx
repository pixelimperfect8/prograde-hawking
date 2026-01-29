import { useStore } from '../../store'
import Slider from './inputs/Slider'

import Section from './inputs/Section'

export default function CubicGlassControl() {
    const { cubicGlass, setCubicGlass } = useStore()

    return (
        <Section title="Mode Settings">
            <Slider
                label="Block Density"
                value={cubicGlass.gridSize}
                min={5}
                max={100}
                step={1}
                onChange={(val) => setCubicGlass({ gridSize: val })}
            />
            <Slider
                label="Smoothness"
                value={cubicGlass.smoothness}
                min={0}
                max={1.0}
                step={0.01}
                onChange={(val) => setCubicGlass({ smoothness: val })}
            />
        </Section>
    )
}
