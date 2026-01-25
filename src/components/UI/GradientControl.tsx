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
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        letterSpacing: '0.5px',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '6px',
                        padding: '0'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFFFFF'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 3 21 3 21 8" />
                        <line x1="4" y1="20" x2="21" y2="3" />
                        <polyline points="21 16 21 21 16 21" />
                        <line x1="15" y1="15" x2="21" y2="21" />
                        <line x1="4" y1="4" x2="9" y2="9" />
                    </svg>
                    Randomize
                </button>
            </div>

            <Select
                label="Preset"
                value="Custom"
                options={Object.keys(PRESETS)}
                onChange={(val) => applyPreset(val)}
            />

            <ColorPicker label="Color 1" value={gradient.color1} onChange={(v) => setGradient({ color1: v })} />
            <ColorPicker label="Color 2" value={gradient.color2} onChange={(v) => setGradient({ color2: v })} />
            <ColorPicker label="Color 3" value={gradient.color3} onChange={(v) => setGradient({ color3: v })} />
            <ColorPicker label="Color 4" value={gradient.color4} onChange={(v) => setGradient({ color4: v })} />

            <Slider label="Speed" value={gradient.speed} min={0} max={2} onChange={(v) => setGradient({ speed: v })} />
            <Slider label="Noise Density" value={gradient.noiseDensity} min={0} max={5} onChange={(v) => setGradient({ noiseDensity: v })} />
            <Slider label="Noise Strength" value={gradient.noiseStrength} min={0} max={2} onChange={(v) => setGradient({ noiseStrength: v })} />

            <Switch label="Wireframe" checked={gradient.wireframe} onChange={(v) => setGradient({ wireframe: v })} />
            <Switch label="Kaleidoscope" checked={gradient.kaleidoscope} onChange={(v) => setGradient({ kaleidoscope: v })} />
            <Switch label="Seamless Loop (10s)" checked={gradient.loop} onChange={(v) => setGradient({ loop: v })} />

            {gradient.loop && (
                <button
                    onClick={() => {
                        const canvas = document.querySelector('canvas')
                        if (!canvas) return

                        const stream = canvas.captureStream(60)
                        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
                        const chunks: Blob[] = []

                        recorder.ondataavailable = (e) => {
                            if (e.data.size > 0) chunks.push(e.data)
                        }

                        recorder.onstop = () => {
                            const blob = new Blob(chunks, { type: 'video/webm' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `gradient-loop-${Date.now()}.webm`
                            a.click()
                        }

                        recorder.start()
                        setTimeout(() => {
                            recorder.stop()
                        }, 10000)
                    }}
                    style={{
                        width: '100%',
                        marginTop: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ff3333',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        letterSpacing: '0.5px',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '8px',
                        padding: '0'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FFFFFF'
                        e.currentTarget.style.textShadow = '0 0 8px rgba(255, 0, 0, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#ff3333'
                        e.currentTarget.style.textShadow = 'none'
                    }}
                >
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'currentColor',
                        boxShadow: '0 0 5px currentColor'
                    }} />
                    Export Loop (10s MP4)
                </button>
            )}

            <button
                onClick={() => {
                    // Collect state
                    const params = new URLSearchParams()
                    params.set('c1', gradient.color1)
                    params.set('c2', gradient.color2)
                    params.set('c3', gradient.color3)
                    params.set('c4', gradient.color4)
                    params.set('spd', gradient.speed.toString())
                    params.set('den', gradient.noiseDensity.toString())
                    params.set('str', gradient.noiseStrength.toString())
                    params.set('wire', gradient.wireframe.toString())
                    params.set('kal', gradient.kaleidoscope.toString())
                    params.set('seg', gradient.kSegments.toString())
                    params.set('loop', gradient.loop.toString())
                    params.set('embed', 'true')

                    const embedUrl = `${window.location.origin}/?${params.toString()}`
                    const iframeCode = `<iframe src="${embedUrl}" width="100%" height="100%" style="border:none; width:100%; height:100vh; display:block;"></iframe>`

                    navigator.clipboard.writeText(iframeCode).then(() => {
                        console.log('Copied iframe!')
                        const btn = document.getElementById('copy-embed-btn')
                        if (btn) {
                            const original = btn.innerText
                            btn.innerText = 'COPIED!'
                            setTimeout(() => btn.innerText = original, 2000)
                        }
                    })
                }}
                id="copy-embed-btn"
                style={{
                    width: '100%',
                    marginTop: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    padding: '10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.color = '#FFFFFF'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
                }}
            >
                Copy Embed Code &lt;/&gt;
            </button>

            <button
                onClick={() => {
                    // Generate Framer component code with current settings
                    const framerCode = `import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

export default function MeshitGradient() {
    const embedUrl = "${window.location.origin}/?c1=${encodeURIComponent(gradient.color1)}&c2=${encodeURIComponent(gradient.color2)}&c3=${encodeURIComponent(gradient.color3)}&c4=${encodeURIComponent(gradient.color4)}&spd=${gradient.speed}&den=${gradient.noiseDensity}&str=${gradient.noiseStrength}&kal=${gradient.kaleidoscope}&loop=${gradient.loop}&embed=true"

    return (
        <iframe
            src={embedUrl}
            style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
            }}
        />
    )
}

addPropertyControls(MeshitGradient, {})`

                    navigator.clipboard.writeText(framerCode).then(() => {
                        const btn = document.getElementById('copy-framer-btn')
                        if (btn) {
                            const original = btn.innerText
                            btn.innerText = 'COPIED!'
                            setTimeout(() => btn.innerText = original, 2000)
                        }
                    })
                }}
                id="copy-framer-btn"
                style={{
                    width: '100%',
                    marginTop: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(0, 153, 255, 0.3)',
                    color: 'rgba(0, 153, 255, 0.8)',
                    padding: '10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 153, 255, 0.6)'
                    e.currentTarget.style.color = '#0099ff'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 153, 255, 0.3)'
                    e.currentTarget.style.color = 'rgba(0, 153, 255, 0.8)'
                }}
            >
                Copy Framer Code
            </button>
        </Section>
    )
}


