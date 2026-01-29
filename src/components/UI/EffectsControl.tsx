import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import Switch from './inputs/Switch'

export default function EffectsControl() {
    const { postfx, setPostFX } = useStore()

    return (
        <>
            {/* Bloom */}
            <Section title="Bloom">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Switch label="Enable" checked={postfx.bloom} onChange={(v) => setPostFX({ bloom: v })} />
                    {postfx.bloom && (
                        <>
                            <Slider label="Intensity" value={postfx.bloomIntensity} min={0} max={3} onChange={(v) => setPostFX({ bloomIntensity: v })} />
                            <Slider label="Threshold" value={postfx.bloomThreshold} min={0} max={1} onChange={(v) => setPostFX({ bloomThreshold: v })} />
                        </>
                    )}
                </div>
            </Section>

            {/* CRT */}
            <Section title="CRT Mode">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Switch label="Enable" checked={postfx.crt} onChange={(v) => setPostFX({ crt: v })} />
                    {postfx.crt && (
                        <>
                            <Slider label="Scanlines" value={postfx.scanlines} min={0} max={1} onChange={(v) => setPostFX({ scanlines: v })} />
                            <Slider label="Aberration" value={postfx.crtAberration} min={0} max={0.02} step={0.001} onChange={(v) => setPostFX({ crtAberration: v })} />
                            <Slider label="Vignette" value={postfx.vignette} min={0} max={1} onChange={(v) => setPostFX({ vignette: v })} />
                        </>
                    )}
                </div>
            </Section>

            {/* Vintage Film */}
            <Section title="Vintage">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Switch label="Enable" checked={postfx.film} onChange={(v) => setPostFX({ film: v })} />
                    {postfx.film && (
                        <>
                            <Slider label="Sepia" value={postfx.filmSepia} min={0} max={1} onChange={(v) => setPostFX({ filmSepia: v })} />
                            <Slider label="Scratches" value={postfx.filmScratches} min={0} max={1} onChange={(v) => setPostFX({ filmScratches: v })} />
                            <Slider label="Dirt" value={postfx.filmDirt} min={0} max={1} onChange={(v) => setPostFX({ filmDirt: v })} />
                        </>
                    )}
                </div>
            </Section>
        </>
    )
}
