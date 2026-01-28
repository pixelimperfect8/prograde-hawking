import { useStore } from '../../store'
import Slider from './inputs/Slider'
import ColorPicker from './inputs/ColorPicker'
import Select from './inputs/Select'
import Section from './inputs/Section'

export default function BlobControl() {
    const { blob, setBlob, randomizeColors } = useStore()

    return (
        <div className="flex flex-col gap-6 p-4">
            <Section title="Settings">
                <button
                    onClick={randomizeColors}
                    className="w-full py-2 mb-2 rounded-md bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-wider font-medium text-white transition-all border border-white/5 hover:border-white/20"
                >
                    🎲 Randomize Colors
                </button>

                <Select
                    label="Direction"
                    value={blob.direction}
                    options={['Top-to-Bottom', 'Bottom-to-Top', 'Left-to-Right', 'Right-to-Left']}
                    onChange={(v) => setBlob({ direction: v as any })}
                />
            </Section>

            <Section title="Blob 1">
                <div className="flex flex-col gap-4">
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
            </Section>

            <Section title="Blob 2">
                <div className="flex flex-col gap-4">
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
            </Section>

            <Section title="Background">
                <div className="flex flex-col gap-4">
                    <ColorPicker
                        label="Color"
                        value={blob.background.color}
                        onChange={(v) => setBlob({ background: { color: v } })}
                    />
                    <Slider
                        label="Noise"
                        value={blob.noise}
                        min={0}
                        max={0.2}
                        step={0.01}
                        onChange={(v) => setBlob({ noise: v })}
                    />
                </div>
            </Section>
        </div>
    )
}
