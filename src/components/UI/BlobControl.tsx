import Select from './inputs/Select'
import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function BlobControl() {
    const { blob, setBlob } = useStore()

    return (
        <Section title="Blob Settings">
            <Select
                label="Direction"
                value={blob.direction}
                options={['Top-to-Bottom', 'Bottom-to-Top', 'Left-to-Right', 'Right-to-Left']}
                onChange={(v) => setBlob({ direction: v as any })}
            />

            <ColorPicker label="Color 1" value={blob.color1} onChange={(v) => setBlob({ color1: v })} />
            <ColorPicker label="Color 2" value={blob.color2} onChange={(v) => setBlob({ color2: v })} />
            <ColorPicker label="Color 3" value={blob.color3} onChange={(v) => setBlob({ color3: v })} />

            <Slider label="Noise" value={blob.noise} min={0} max={0.5} onChange={(v) => setBlob({ noise: v })} />

            <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Offsets</span>
                <Slider label="Offset 1 X" value={blob.offset1.x} min={-0.5} max={0.5} onChange={(v) => setBlob({ offset1: { ...blob.offset1, x: v } })} />
                <Slider label="Offset 1 Y" value={blob.offset1.y} min={-0.5} max={0.5} onChange={(v) => setBlob({ offset1: { ...blob.offset1, y: v } })} />
                <Slider label="Offset 2 X" value={blob.offset2.x} min={-0.5} max={0.5} onChange={(v) => setBlob({ offset2: { ...blob.offset2, x: v } })} />
                <Slider label="Offset 2 Y" value={blob.offset2.y} min={-0.5} max={0.5} onChange={(v) => setBlob({ offset2: { ...blob.offset2, y: v } })} />
            </div>
        </Section>
    )
}
