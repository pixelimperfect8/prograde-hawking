import { useStore } from '../../store'
import ColorPicker from './inputs/ColorPicker'
import Slider from './inputs/Slider'
import Section from './inputs/Section'

export default function FluidFlowControl() {
    const { fluid, setFluid } = useStore()

    const { color1, color2, color3, color4, background, speed, density, strength } = fluid

    return (
        <Section title="Fluid Flow">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Colors */}
                <div>
                    <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Palette</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        <ColorPicker label="Background" value={background} onChange={(c: string) => setFluid({ background: c })} />
                        <ColorPicker label="Color 1" value={color1} onChange={(c: string) => setFluid({ color1: c })} />
                        <ColorPicker label="Color 2" value={color2} onChange={(c: string) => setFluid({ color2: c })} />
                        <ColorPicker label="Color 3" value={color3} onChange={(c: string) => setFluid({ color3: c })} />
                        <ColorPicker label="Color 4" value={color4} onChange={(c: string) => setFluid({ color4: c })} />
                    </div>
                </div>

                {/* Parameters */}
                <div>
                    <span style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Simulation</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        <Slider label="Flow Speed" value={speed} min={0.0} max={1.0} onChange={(v: number) => setFluid({ speed: v })} />
                        <Slider label="Noise Density" value={density} min={0.2} max={2.0} onChange={(v: number) => setFluid({ density: v })} />
                        <Slider label="Warp Strength" value={strength} min={0.0} max={1.0} onChange={(v: number) => setFluid({ strength: v })} />
                    </div>
                </div>

            </div>
        </Section>
    )
}
