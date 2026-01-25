import { useStore } from '../../store'
import Section from './inputs/Section'
import Select from './inputs/Select'
import ColorPicker from './inputs/ColorPicker'
import Switch from './inputs/Switch'

export default function SceneControl() {
    const { scene, glass, setScene, setGlass } = useStore()

    return (
        <Section title="Scene">
            <Select
                label="Background Mode"
                value={scene.bgMode}
                options={['Gradient', 'Solid + Glow', 'Lava Lamp', 'Blob Stack']}
                onChange={(val) => setScene({ bgMode: val as any })}
            />

            {scene.bgMode === 'Solid + Glow' && (
                <ColorPicker
                    label="Solid Color"
                    value={scene.solidColor}
                    onChange={(val) => setScene({ solidColor: val })}
                />
            )}

            <Switch
                label="Glass Overlay"
                checked={glass.enabled}
                onChange={(val) => setGlass({ enabled: val })}
            />
        </Section>
    )
}
