import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function LavaControl() {
    const { lava, setLava, randomizeColors } = useStore()

    return (
        <Section title="Lava Settings">
            <button
                onClick={randomizeColors}
                style={{
                    width: '100%',
                    marginBottom: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.7)',
                    padding: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}
            >
                🎲 Randomize Colors
            </button>

            <ColorPicker label="Background" value={lava.background} onChange={(v) => setLava({ background: v })} />
            <ColorPicker label="Color 1" value={lava.color1} onChange={(v) => setLava({ color1: v })} />
            <ColorPicker label="Color 2" value={lava.color2} onChange={(v) => setLava({ color2: v })} />
            <ColorPicker label="Color 3" value={lava.color3} onChange={(v) => setLava({ color3: v })} />

            <Slider label="Speed" value={lava.speed} min={0} max={2} onChange={(v) => setLava({ speed: v })} />
            <Slider label="Threshold" value={lava.threshold} min={0} max={2} onChange={(v) => setLava({ threshold: v })} />
        </Section>
    )
}
