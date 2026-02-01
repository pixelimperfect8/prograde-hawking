import { useStore } from '../../store'
import Slider from './inputs/Slider'
import Switch from './inputs/Switch'
import Section from './inputs/Section'

export default function GeneralSettingsControl() {
    const {
        scene,
        gradient, setGradient,
        liquidMetal, setLiquidMetal,
        cubicGlass, setCubicGlass,
        lava, setLava,
        fluid, setFluid,
        ripples, setRipples,
        orbs, setOrbs,
        flowGradient, setFlowGradient,
        intelligenceGlow, setIntelligenceGlow,
        postfx, setPostFX
    } = useStore()

    const mode = scene.bgMode

    const renderSpeed = () => {
        let value = 0
        let onChange: (v: number) => void = () => { }
        let label = "Animation Speed"
        let max = 1.0

        switch (mode) {
            case 'Gradient':
                value = gradient.speed; onChange = (v) => setGradient({ speed: v }); break
            case 'Acid Trip':
                value = fluid.speed; onChange = (v) => setFluid({ speed: v }); break
            case 'Liquid Metal':
                value = liquidMetal.speed; onChange = (v) => setLiquidMetal({ speed: v }); break
            case 'Cubic':
                value = cubicGlass.speed; onChange = (v) => setCubicGlass({ speed: v }); max = 2.0; break
            case 'Lava Lamp':
                value = lava.speed; onChange = (v) => setLava({ speed: v }); break
            case 'Orbs':
                value = orbs.speed; onChange = (v) => setOrbs({ speed: v }); break
            case 'Flow Gradient':
                value = flowGradient.speed; onChange = (v) => setFlowGradient({ speed: v }); break
            case 'Intelligence Glow':
                value = intelligenceGlow.speed; onChange = (v) => setIntelligenceGlow({ speed: v }); break
            case 'Ripples':
                value = ripples.speed; onChange = (v) => setRipples({ speed: v }); break
            case 'Linear Gradient':
                return null // Handled in AdvancedGradientControl
            case 'Solid + Glow':
                return null // No global speed, uses Pulse Speed which is specific
            default:
                return null
        }

        return <Slider label={label} value={value} min={0} max={max} step={0.01} onChange={onChange} />
    }

    return (
        <Section title="General Settings">
            {renderSpeed()}



            <Slider
                label="Grain Strength"
                value={postfx.grain || 0}
                min={0}
                max={0.25}
                step={0.01}
                onChange={(v) => setPostFX({ grain: v })}
            />

            <Switch
                label="Dither (Grit)"
                checked={postfx.dither}
                onChange={(v) => setPostFX({ dither: v })}
            />

            {postfx.dither && (
                <Slider
                    label="Dither Intensity"
                    value={postfx.ditherOpacity}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    onChange={(v) => setPostFX({ ditherOpacity: v })}
                />
            )}
        </Section>
    )
}
