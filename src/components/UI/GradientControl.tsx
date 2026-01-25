import { useStore, PRESETS } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'
import Select from './inputs/Select'
import Switch from './inputs/Switch'

export default function GradientControl() {
    const { gradient, setGradient, applyPreset, randomizeColors } = useStore()

    return (
        <Section title="Gradient">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button
                    onClick={randomizeColors}
                    style={{
                        flex: 1,
                        padding: '8px',
                        fontSize: '0.8rem',
                        background: 'transparent',
                        border: '1px solid #FBFF00', // Outline
                        borderRadius: '4px',
                        color: '#FBFF00',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500
                    }}
                >
                    Randomize
                </button>
            </div>

            <Select
                label="Preset"
                value="Custom" // Naive implementation, purely for switching
                options={Object.keys(PRESETS)}
                onChange={(val) => applyPreset(val)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <ColorPicker label="Color 1" value={gradient.color1} onChange={(v) => setGradient({ color1: v })} />
                <ColorPicker label="Color 2" value={gradient.color2} onChange={(v) => setGradient({ color2: v })} />
                <ColorPicker label="Color 3" value={gradient.color3} onChange={(v) => setGradient({ color3: v })} />
                <ColorPicker label="Color 4" value={gradient.color4} onChange={(v) => setGradient({ color4: v })} />
            </div>

            <Slider label="Speed" value={gradient.speed} min={0} max={2} onChange={(v) => setGradient({ speed: v })} />
            <Slider label="Noise Density" value={gradient.noiseDensity} min={0} max={5} onChange={(v) => setGradient({ noiseDensity: v })} />
            <Slider label="Noise Strength" value={gradient.noiseStrength} min={0} max={2} onChange={(v) => setGradient({ noiseStrength: v })} />

            <Switch label="Wireframe" checked={gradient.wireframe} onChange={(v) => setGradient({ wireframe: v })} />
            <Switch label="Kaleidoscope" checked={gradient.kaleidoscope} onChange={(v) => setGradient({ kaleidoscope: v })} />
        </Section>
    )
}
