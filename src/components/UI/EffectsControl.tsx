import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import Switch from './inputs/Switch'

export default function EffectsControl() {
    const { postfx, setPostFX } = useStore()

    return (
        <Section title="Effects">
            {/* Static Grain */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <Slider label="Static Grain" value={postfx.grain || 0} min={0} max={0.25} step={0.01} onChange={(v) => setPostFX({ grain: v })} />
            </div>

            {/* Dither */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Switch label="Dither (Animated)" checked={postfx.dither} onChange={(v) => setPostFX({ dither: v })} />
                {postfx.dither && (
                    <Slider label="Opacity" value={postfx.ditherOpacity} min={0} max={1} onChange={(v) => setPostFX({ ditherOpacity: v })} />
                )}
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '16px 0 16px 0' }} />

            {/* Bloom */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Switch label="Bloom (Glow)" checked={postfx.bloom} onChange={(v) => setPostFX({ bloom: v })} />
                {postfx.bloom && (
                    <>
                        <Slider label="Intensity" value={postfx.bloomIntensity} min={0} max={3} onChange={(v) => setPostFX({ bloomIntensity: v })} />
                        <Slider label="Threshold" value={postfx.bloomThreshold} min={0} max={1} onChange={(v) => setPostFX({ bloomThreshold: v })} />
                    </>
                )}
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '16px 0 16px 0' }} />

            {/* CRT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Switch label="CRT Mode" checked={postfx.crt} onChange={(v) => setPostFX({ crt: v })} />
                {postfx.crt && (
                    <>
                        <Slider label="Scanlines" value={postfx.scanlines} min={0} max={1} onChange={(v) => setPostFX({ scanlines: v })} />
                        <Slider label="Aberration" value={postfx.crtAberration} min={0} max={0.02} step={0.001} onChange={(v) => setPostFX({ crtAberration: v })} />
                        <Slider label="Vignette" value={postfx.vignette} min={0} max={1} onChange={(v) => setPostFX({ vignette: v })} />
                    </>
                )}
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '16px 0 16px 0' }} />

            {/* Vintage Film */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Switch label="Vintage Film" checked={postfx.film} onChange={(v) => setPostFX({ film: v })} />
                {postfx.film && (
                    <>
                        <Slider label="Sepia" value={postfx.filmSepia} min={0} max={1} onChange={(v) => setPostFX({ filmSepia: v })} />
                        <Slider label="Scratches" value={postfx.filmScratches} min={0} max={1} onChange={(v) => setPostFX({ filmScratches: v })} />
                        <Slider label="Dirt" value={postfx.filmDirt} min={0} max={1} onChange={(v) => setPostFX({ filmDirt: v })} />
                    </>
                )}
            </div>
        </Section>
    )
}
