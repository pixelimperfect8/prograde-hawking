import { useStore, PRESETS } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import Select from './inputs/Select'
import Switch from './inputs/Switch'

export default function GradientControl() {
    const { gradient, setGradient, applyPreset } = useStore()

    return (
        <Section title="Mode Settings">
            <Select
                label="Preset"
                value="Custom"
                options={Object.keys(PRESETS)}
                onChange={(val) => applyPreset(val)}
            />

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
        </Section>
    )
}

