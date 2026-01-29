
import { useStore } from '../../store'
import Slider from './inputs/Slider'
import Section from './inputs/Section'

export default function IntelligenceGlowControl() {
    const { intelligenceGlow, setIntelligenceGlow } = useStore()

    return (
        <Section title="Mode Settings">
            <Slider
                label="Flow Speed"
                value={intelligenceGlow.speed}
                min={0}
                max={2.0}
                step={0.01}
                onChange={(v) => setIntelligenceGlow({ speed: v })}
            />
            <Slider
                label="Pulse Speed"
                value={intelligenceGlow.pulseSpeed}
                min={0}
                max={5.0}
                step={0.1}
                onChange={(v) => setIntelligenceGlow({ pulseSpeed: v })}
            />
            <Slider
                label="Thickness"
                value={intelligenceGlow.thickness}
                min={0.01}
                max={0.5}
                step={0.01}
                onChange={(v) => setIntelligenceGlow({ thickness: v })}
            />
            <Slider
                label="Noise Scale"
                value={intelligenceGlow.noiseScale}
                min={0.5}
                max={10.0}
                step={0.1}
                onChange={(v) => setIntelligenceGlow({ noiseScale: v })}
            />
            <Slider
                label="Distortion"
                value={intelligenceGlow.distortion}
                min={0}
                max={5.0}
                step={0.1}
                onChange={(v) => setIntelligenceGlow({ distortion: v })}
            />
        </Section>
    )
}
