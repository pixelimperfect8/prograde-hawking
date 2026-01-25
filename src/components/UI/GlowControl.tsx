import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function GlowControl() {
    const { glow, setGlow, randomizeColors } = useStore()

    return (
        <Section title="Glow Settings">
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

            {/* Glow 1 Group */}
            <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Glow 1</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <ColorPicker label="Color" value={glow.color1} onChange={(v) => setGlow({ color1: v })} />
                    <Slider label="Radius" value={glow.radius1} min={0} max={2} onChange={(v) => setGlow({ radius1: v })} />
                    <Slider label="Position X" value={glow.pos1.x} min={0} max={1} onChange={(v) => setGlow({ pos1: { ...glow.pos1, x: v } })} />
                    <Slider label="Position Y" value={glow.pos1.y} min={0} max={1} onChange={(v) => setGlow({ pos1: { ...glow.pos1, y: v } })} />
                </div>
            </div>

            {/* Glow 2 Group */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Glow 2</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <ColorPicker label="Color" value={glow.color2} onChange={(v) => setGlow({ color2: v })} />
                    <Slider label="Radius" value={glow.radius2} min={0} max={2} onChange={(v) => setGlow({ radius2: v })} />
                    <Slider label="Position X" value={glow.pos2.x} min={0} max={1} onChange={(v) => setGlow({ pos2: { ...glow.pos2, x: v } })} />
                    <Slider label="Position Y" value={glow.pos2.y} min={0} max={1} onChange={(v) => setGlow({ pos2: { ...glow.pos2, y: v } })} />
                </div>
            </div>

            {/* Global Settings */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Effects</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <Slider label="Intensity" value={glow.intensity} min={0} max={3} onChange={(v) => setGlow({ intensity: v })} />
                    <Slider label="Pulse Speed" value={glow.pulseSpeed} min={0} max={5} onChange={(v) => setGlow({ pulseSpeed: v })} />
                </div>
            </div>
        </Section>
    )
}
