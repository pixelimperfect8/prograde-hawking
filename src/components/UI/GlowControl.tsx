import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import SubSectionHeader from './inputs/SubSectionHeader'


export default function GlowControl() {
    const { glow, setGlow } = useStore()

    return (
        <Section title="Mode Settings">
            {/* Glow 1 Group */}
            <div style={{ marginTop: '16px' }}>
                <SubSectionHeader title="Glow 1" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <Slider label="Radius" value={glow.radius1} min={0} max={2} onChange={(v) => setGlow({ radius1: v })} />
                    <Slider label="Position X" value={glow.pos1.x} min={0} max={1} onChange={(v) => setGlow({ pos1: { ...glow.pos1, x: v } })} />
                    <Slider label="Position Y" value={glow.pos1.y} min={0} max={1} onChange={(v) => setGlow({ pos1: { ...glow.pos1, y: v } })} />
                </div>
            </div>

            {/* Glow 2 Group */}
            <div style={{ marginTop: '24px' }}>
                <SubSectionHeader title="Glow 2" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <Slider label="Radius" value={glow.radius2} min={0} max={2} onChange={(v) => setGlow({ radius2: v })} />
                    <Slider label="Position X" value={glow.pos2.x} min={0} max={1} onChange={(v) => setGlow({ pos2: { ...glow.pos2, x: v } })} />
                    <Slider label="Position Y" value={glow.pos2.y} min={0} max={1} onChange={(v) => setGlow({ pos2: { ...glow.pos2, y: v } })} />
                </div>
            </div>

            {/* Global Settings */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <SubSectionHeader title="Effects" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <Slider label="Intensity" value={glow.intensity} min={0} max={3} onChange={(v) => setGlow({ intensity: v })} />
                    <Slider label="Pulse Speed" value={glow.pulseSpeed} min={0} max={5} onChange={(v) => setGlow({ pulseSpeed: v })} />
                </div>
            </div>
        </Section>
    )
}
