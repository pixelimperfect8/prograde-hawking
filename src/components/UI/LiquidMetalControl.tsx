import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'

export default function LiquidMetalControl() {
    const { liquidMetal, setLiquidMetal } = useStore()

    return (
        <>
            <Section title="Material">
                <div style={{ padding: '0 8px 8px 8px' }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Base Color</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="color"
                            value={liquidMetal.color}
                            onChange={(e) => setLiquidMetal({ color: e.target.value })}
                            style={{
                                width: '100%',
                                height: '28px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ fontSize: '11px', color: '#ccc' }}>{liquidMetal.color.toUpperCase()}</span>
                    </div>
                </div>

                <Slider
                    label="Metalness"
                    value={liquidMetal.metalness}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(val) => setLiquidMetal({ metalness: val })}
                />

                <Slider
                    label="Roughness"
                    value={liquidMetal.roughness}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(val) => setLiquidMetal({ roughness: val })}
                />
            </Section>

            <Section title="Simulation">
                <Slider
                    label="Flow Speed"
                    value={liquidMetal.speed}
                    min={0}
                    max={1.0}
                    step={0.01}
                    onChange={(val) => setLiquidMetal({ speed: val })}
                />

                <Slider
                    label="Distortion"
                    value={liquidMetal.distortion}
                    min={0}
                    max={3.0}
                    step={0.1}
                    onChange={(val) => setLiquidMetal({ distortion: val })}
                />
            </Section>
        </>
    )
}
