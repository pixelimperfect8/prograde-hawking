import { useStore } from '../../store'
import Slider from './inputs/Slider'

import Section from './inputs/Section'

export default function LiquidMetalControl() {
    const { liquidMetal, setLiquidMetal } = useStore()

    return (
        <Section title="Mode Settings">
            <Slider
                label="Zoom / Scale"
                value={liquidMetal.distortion}
                min={0.1}
                max={4.0}
                step={0.1}
                onChange={(val) => setLiquidMetal({ distortion: val })}
            />
            <Slider
                label="Fluid Warp"
                value={liquidMetal.metalness}
                min={0}
                max={20}
                step={0.1}
                onChange={(val) => setLiquidMetal({ metalness: val })}
            />
            <Slider
                label="Detail Swirls"
                value={liquidMetal.roughness}
                min={0}
                max={2.0}
                step={0.01}
                onChange={(val) => setLiquidMetal({ roughness: val })}
            />
        </Section>
    )
}
