import Select from './inputs/Select'
import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'
import Switch from './inputs/Switch'

export default function BlobControl() {
    const { blob, setBlob, randomizeColors } = useStore()

    return (
        <Section title="Blob Settings">
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
            {/* Global Direction */}
            <Select
                label="Direction"
                value={blob.direction}
                options={['Top-to-Bottom', 'Bottom-to-Top', 'Left-to-Right', 'Right-to-Left']}
                onChange={(v) => setBlob({ direction: v as any })}
            />

            {/* Blob 1 Group */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Blob 1</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <ColorPicker
                        label="Color"
                        value={blob.blob1.color}
                        onChange={(v) => setBlob({ blob1: { ...blob.blob1, color: v } })}
                    />
                    <Slider
                        label="Size"
                        value={blob.blob1.size}
                        min={0.1}
                        max={1.5}
                        onChange={(v) => setBlob({ blob1: { ...blob.blob1, size: v } })}
                    />
                    <Slider
                        label="Offset X"
                        value={blob.blob1.offsetX}
                        min={-0.5}
                        max={0.5}
                        onChange={(v) => setBlob({ blob1: { ...blob.blob1, offsetX: v } })}
                    />
                    <Slider
                        label="Offset Y"
                        value={blob.blob1.offsetY}
                        min={-0.5}
                        max={0.5}
                        onChange={(v) => setBlob({ blob1: { ...blob.blob1, offsetY: v } })}
                    />
                </div>
            </div>

            {/* Blob 2 Group */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Blob 2</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <ColorPicker
                        label="Color"
                        value={blob.blob2.color}
                        onChange={(v) => setBlob({ blob2: { ...blob.blob2, color: v } })}
                    />
                    <Slider
                        label="Size"
                        value={blob.blob2.size}
                        min={0.1}
                        max={1.5}
                        onChange={(v) => setBlob({ blob2: { ...blob.blob2, size: v } })}
                    />
                    <Slider
                        label="Offset X"
                        value={blob.blob2.offsetX}
                        min={-0.5}
                        max={0.5}
                        onChange={(v) => setBlob({ blob2: { ...blob.blob2, offsetX: v } })}
                    />
                    <Slider
                        label="Offset Y"
                        value={blob.blob2.offsetY}
                        min={-0.5}
                        max={0.5}
                        onChange={(v) => setBlob({ blob2: { ...blob.blob2, offsetY: v } })}
                    />
                </div>
            </div>

            {/* Background Group */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Background</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <ColorPicker
                        label="Color"
                        value={blob.background.color}
                        onChange={(v) => setBlob({ background: { color: v } })}
                    />
                </div>
            </div>

            {/* Animation & Effects Group */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Animation</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                    <Switch
                        label="Enable"
                        checked={blob.animation.enabled}
                        onChange={(v) => setBlob({ animation: { ...blob.animation, enabled: v } })}
                    />
                    {blob.animation.enabled && (
                        <>
                            <Select
                                label="Type"
                                value={blob.animation.type}
                                options={['Pulse', 'Float', 'Breathe']}
                                onChange={(v) => setBlob({ animation: { ...blob.animation, type: v as any } })}
                            />
                            <Slider
                                label="Speed"
                                value={blob.animation.speed}
                                min={0.1}
                                max={3}
                                onChange={(v) => setBlob({ animation: { ...blob.animation, speed: v } })}
                            />
                        </>
                    )}
                    <Slider label="Noise" value={blob.noise} min={0} max={0.5} onChange={(v) => setBlob({ noise: v })} />
                </div>
            </div>
        </Section>
    )
}
