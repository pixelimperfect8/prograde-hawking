import { useStore } from '../../store'
import Slider from './inputs/Slider'
import Select from './inputs/Select'
import Switch from './inputs/Switch'
import Section from './inputs/Section'

export default function BlobControl() {
    const { blob, setBlob } = useStore()

    const labelStyle = { color: '#888', fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '1px', fontWeight: 600, marginTop: '24px', marginBottom: '8px' }

    return (
        <Section title="Mode Settings">
            {/* Animation Controls */}
            <div style={labelStyle}>Animation</div>
            <Switch
                label="Enable Animation"
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
                        max={3.0}
                        step={0.1}
                        onChange={(v) => setBlob({ animation: { ...blob.animation, speed: v } })}
                    />
                </>
            )}

            <div style={labelStyle}>Blob 1</div>
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

            <div style={labelStyle}>Blob 2</div>
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
        </Section>
    )
}
