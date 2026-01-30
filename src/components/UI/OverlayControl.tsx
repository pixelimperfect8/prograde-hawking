import { useStore } from '../../store'
import Section from './inputs/Section'
import Switch from './inputs/Switch'
import Select from './inputs/Select'
import Slider from './inputs/Slider'
import ColorRow from './inputs/ColorRow'

export default function OverlayControl() {
    const { overlay, setOverlay } = useStore()

    const update = (partial: any) => setOverlay(partial)

    return (
        <Section title="Pattern Overlay">
            <Switch
                label="Enable"
                checked={overlay.enabled}
                onChange={(v) => update({ enabled: v })}
            />

            {overlay.enabled && (
                <>
                    <Select
                        label="Pattern"
                        value={overlay.type}
                        options={[
                            'Grid', 'Grid + Dot', 'Cross', 'Hexagon', 'Tech',
                            'Dots', 'Architectural', 'Outlined Dots',
                            'Chevrons', 'Diagonal Grid', 'Hex Dots'
                        ]}
                        onChange={(v) => update({ type: v })}
                    />

                    <ColorRow
                        label="Color"
                        value={overlay.color}
                        onChange={(c: string) => update({ color: c })}
                        onRemove={() => { }} // No remove logic needed
                        canRemove={false}
                    />

                    <Switch
                        label="Spotlight Mode"
                        checked={overlay.spotlight}
                        onChange={(v) => update({ spotlight: v })}
                    />

                    <Slider
                        label="Opacity"
                        value={overlay.opacity}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(v: number) => update({ opacity: v })}
                    />

                    <Slider
                        label="Scale"
                        value={overlay.scale}
                        min={1}
                        max={100}
                        step={1}
                        onChange={(v: number) => update({ scale: v })}
                    />

                    <Slider
                        label="Thickness"
                        value={overlay.thickness}
                        min={0.01}
                        max={0.5}
                        step={0.01}
                        onChange={(v: number) => update({ thickness: v })}
                    />

                    {overlay.type === 'Tech' && (
                        <Slider
                            label="Anim Speed"
                            value={overlay.speed}
                            min={0}
                            max={2}
                            step={0.05}
                            onChange={(v: number) => update({ speed: v })}
                        />
                    )}
                </>
            )}
        </Section>
    )
}
