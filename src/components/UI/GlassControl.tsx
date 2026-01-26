import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import Switch from './inputs/Switch'
import Select from './inputs/Select'

export default function GlassControl() {
    const { glass, setGlass } = useStore()

    return (
        <Section title="Glass Overlay">
            <Switch label="Enabled" checked={glass.enabled} onChange={(v) => setGlass({ enabled: v })} />

            {glass.enabled && (
                <>
                    <Select
                        label="Pattern"
                        value={glass.patternType}
                        options={['Linear', 'Kaleidoscope']}
                        onChange={(v) => setGlass({ patternType: v as any })}
                    />
                    <Select
                        label="Ridge Shape"
                        value={glass.ridgeProfile}
                        options={['Round', 'Sharp', 'Square']}
                        onChange={(v) => setGlass({ ridgeProfile: v as any })}
                    />

                    <Slider label="Transmission" value={glass.transmission} min={0} max={1} onChange={(v) => setGlass({ transmission: v })} />
                    <Slider label="Thickness" value={glass.thickness} min={0} max={2} onChange={(v) => setGlass({ thickness: v })} />
                    <Slider label="Roughness" value={glass.roughness} min={0} max={1} onChange={(v) => setGlass({ roughness: v })} />
                    <Slider label="Aberration" value={glass.chromaticAberration} min={0} max={0.2} onChange={(v) => setGlass({ chromaticAberration: v })} />
                    <Slider label="Scale" value={glass.fluteScale} min={0.1} max={5} onChange={(v) => setGlass({ fluteScale: v })} />
                    <Slider label="Ripple Density" value={glass.rippleDensity} min={1} max={50} step={1} onChange={(v) => setGlass({ rippleDensity: v })} />
                    <Slider label="Curvature" value={glass.curvature || 0} min={-1} max={1} step={0.01} onChange={(v) => setGlass({ curvature: v })} />

                    <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Animation</span>
                        <Switch label="Animate Flow" checked={glass.animate} onChange={(v) => setGlass({ animate: v })} />
                        <Slider label="Flow Speed" value={glass.flowSpeed} min={0} max={2} onChange={(v) => setGlass({ flowSpeed: v })} />
                        <Slider label="Rotation" value={glass.patternRotation} min={0} max={360} step={1} onChange={(v) => setGlass({ patternRotation: v })} />
                    </div>
                </>
            )}
        </Section>
    )
}
