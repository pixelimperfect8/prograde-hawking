import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import Switch from './inputs/Switch'
import Select from './inputs/Select'

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
            {/* Halftone */}
            <Section title="Halftone">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Switch label="Enable" checked={postfx.halftone} onChange={(v) => setPostFX({ halftone: v })} />
                    {postfx.halftone && (
                        <>
                            <Select
                                label="Shape"
                                value={postfx.halftoneShape}
                                options={['Round', 'Square', 'Line']}
                                onChange={(v) => setPostFX({ halftoneShape: v as any })}
                            />
                            <Slider label="Resolution" value={postfx.halftoneResolution} min={10} max={300} step={5} onChange={(v) => setPostFX({ halftoneResolution: v })} />
                            <Slider label="Scale" value={postfx.halftoneScale} min={0.1} max={2.0} step={0.05} onChange={(v) => setPostFX({ halftoneScale: v })} />
                            <Slider label="Rotate" value={postfx.halftoneRotate} min={-180} max={180} step={5} onChange={(v) => setPostFX({ halftoneRotate: v })} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#888', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>Background</span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={postfx.halftoneBgColor || '#000000'}
                                        onChange={(e) => setPostFX({ halftoneBgColor: e.target.value })}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            padding: 0,
                                            border: 'none',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            background: 'none'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={postfx.halftoneBgColor || '#000000'}
                                        onChange={(e) => setPostFX({ halftoneBgColor: e.target.value })}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '3px',
                                            color: '#ccc',
                                            fontFamily: 'monospace',
                                            fontSize: '10px',
                                            padding: '4px',
                                            width: '60px',
                                            textAlign: 'center'
                                        }}
                                    />
                                </div>
                            </div>

                            <Switch label="Monochrome" checked={postfx.halftoneMonochrome} onChange={(v) => setPostFX({ halftoneMonochrome: v })} />

                            {postfx.halftoneMonochrome && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#888', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>Color</span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="color"
                                            value={postfx.halftoneColor || '#ffffff'}
                                            onChange={(e) => setPostFX({ halftoneColor: e.target.value })}
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                padding: 0,
                                                border: 'none',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                background: 'none'
                                            }}
                                        />
                                        <input
                                            type="text"
                                            value={postfx.halftoneColor || '#ffffff'}
                                            onChange={(e) => setPostFX({ halftoneColor: e.target.value })}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '3px',
                                                color: '#ccc',
                                                fontFamily: 'monospace',
                                                fontSize: '10px',
                                                padding: '4px',
                                                width: '60px',
                                                textAlign: 'center'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Section>
        </>
    )
}
