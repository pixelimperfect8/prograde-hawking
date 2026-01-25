import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'

export default function BlobControl() {
    const { blob, setBlob } = useStore()

    return (
        <Section title="Blob Settings">
            <ColorPicker label="Color 1" value={blob.color1} onChange={(v) => setBlob({ color1: v })} />
            <ColorPicker label="Color 2" value={blob.color2} onChange={(v) => setBlob({ color2: v })} />
            <ColorPicker label="Color 3" value={blob.color3} onChange={(v) => setBlob({ color3: v })} />

            <Slider label="Noise" value={blob.noise} min={0} max={0.5} onChange={(v) => setBlob({ noise: v })} />
        </Section>
    )
}
