import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import Select from './inputs/Select'
import ColorPicker from './inputs/ColorPicker'

export default function AdvancedGradientControl() {
    const { advancedGradient, setAdvancedGradient } = useStore()
    const { colors, type, angle, centerX, centerY, animation, speed, roughness } = advancedGradient

    const handleColorChange = (index: number, val: string) => {
        const newColors = [...colors]
        newColors[index] = val
        setAdvancedGradient({ colors: newColors })
    }

    const addColor = () => {
        if (colors.length >= 10) return
        setAdvancedGradient({ colors: [...colors, '#ffffff'] })
    }

    const removeColor = (index: number) => {
        if (colors.length <= 2) return
        const newColors = colors.filter((_, i) => i !== index)
        setAdvancedGradient({ colors: newColors })
    }

    return (
        <>
            <Section title="Gradient Type">
                <Select
                    label="Type"
                    value={type}
                    options={['Linear', 'Radial']}
                    onChange={(val) => setAdvancedGradient({ type: val as any })}
                />
            </Section>

            <Section title="Colors">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    {colors.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <ColorPicker
                                    label={`Color ${i + 1}`}
                                    value={c}
                                    onChange={(val) => handleColorChange(i, val)}
                                />
                            </div>
                            <button
                                onClick={() => removeColor(i)}
                                disabled={colors.length <= 2}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: colors.length <= 2 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    cursor: colors.length <= 2 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    marginTop: '8px' // Align with picker
                                }}
                            >
                                -
                            </button>
                        </div>
                    ))}

                    {colors.length < 10 && (
                        <button
                            onClick={addColor}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.6)',
                                padding: '8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                marginTop: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            + Add Color
                        </button>
                    )}
                </div>
            </Section>

            <Section title="Settings">
                {type === 'Linear' && (
                    <Slider
                        label="Angle"
                        value={angle}
                        min={0}
                        max={360}
                        step={1}
                        onChange={(val) => setAdvancedGradient({ angle: val })}
                    />
                )}
                {type === 'Radial' && (
                    <>
                        <Slider
                            label="Center X"
                            value={centerX}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(val) => setAdvancedGradient({ centerX: val })}
                        />
                        <Slider
                            label="Center Y"
                            value={centerY}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(val) => setAdvancedGradient({ centerY: val })}
                        />
                    </>
                )}

                <Select
                    label="Animation"
                    value={animation}
                    options={['Static', 'Flow', 'Pulse']}
                    onChange={(val) => setAdvancedGradient({ animation: val as any })}
                />

                {animation !== 'Static' && (
                    <Slider
                        label="Speed"
                        value={speed}
                        min={0}
                        max={2}
                        step={0.05}
                        onChange={(val) => setAdvancedGradient({ speed: val })}
                    />
                )}

                <Slider
                    label="Roughness (Grain)"
                    value={roughness}
                    min={0}
                    max={0.5}
                    step={0.01}
                    onChange={(val) => setAdvancedGradient({ roughness: val })}
                />

            </Section>
        </>
    )
}
