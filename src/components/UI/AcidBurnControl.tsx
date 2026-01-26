import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function AcidBurnControl() {
    const { acidBurn, setAcidBurn, randomizeColors } = useStore()

    return (
        <Section title="Acid Burn">
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

            {/* Colors Group */}
            <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Colors</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <ColorPicker label="Burn 1" value={acidBurn.color1} onChange={(v) => setAcidBurn({ color1: v })} />
                    <ColorPicker label="Burn 2" value={acidBurn.color2} onChange={(v) => setAcidBurn({ color2: v })} />
                    <ColorPicker label="Burn 3" value={acidBurn.color3} onChange={(v) => setAcidBurn({ color3: v })} />
                    <ColorPicker label="Background" value={acidBurn.background} onChange={(v) => setAcidBurn({ background: v })} />
                    <ColorPicker label="Edge Glow" value={acidBurn.burnColor} onChange={(v) => setAcidBurn({ burnColor: v })} />
                </div>
            </div>

            {/* Effects Group */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Effects</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <Slider label="Speed" value={acidBurn.speed} min={0.05} max={0.5} onChange={(v) => setAcidBurn({ speed: v })} />
                    <Slider label="Dot Scale" value={acidBurn.threshold} min={0.2} max={1.0} onChange={(v) => setAcidBurn({ threshold: v })} />
                    <Slider label="Ring Width" value={acidBurn.burnWidth} min={0.05} max={0.4} onChange={(v) => setAcidBurn({ burnWidth: v })} />
                    <Slider label="Warp" value={acidBurn.warp} min={0.1} max={0.8} onChange={(v) => setAcidBurn({ warp: v })} />
                </div>
            </div>
        </Section>
    )
}
