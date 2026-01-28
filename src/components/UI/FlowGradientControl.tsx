import { useStore } from '../../store'
import ColorPicker from './inputs/ColorPicker'
import Section from './inputs/Section'
import Slider from './inputs/Slider'

export default function FlowGradientControl() {
    const { flowGradient, setFlowGradient, randomizeColors } = useStore()

    return (
        <Section title="Flow Gradient Settings">
            <button
                onClick={randomizeColors}
                className="w-full py-2 mb-4 rounded-md bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-wider font-medium text-white transition-all border border-white/5 hover:border-white/20"
            >
                🎲 Randomize Colors
            </button>

            <ColorPicker label="Color 1" value={flowGradient.color1} onChange={(c) => setFlowGradient({ color1: c })} />
            <ColorPicker label="Color 2" value={flowGradient.color2} onChange={(c) => setFlowGradient({ color2: c })} />
            <ColorPicker label="Color 3" value={flowGradient.color3} onChange={(c) => setFlowGradient({ color3: c })} />
            <ColorPicker label="Color 4" value={flowGradient.color4} onChange={(c) => setFlowGradient({ color4: c })} />

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0 16px 0' }} />

            <Slider
                label="Flow Speed"
                value={flowGradient.speed}
                min={0}
                max={1.0}
                step={0.01}
                onChange={(v) => setFlowGradient({ speed: v })}
            />
            {/* 
            <Slider
                label="Amplitude"
                value={flowGradient.noiseAmp}
                min={0}
                max={1000}
                step={10}
                onChange={(v) => setFlowGradient({ noiseAmp: v })}
            />
            */}

            <Slider
                label="Grain Strength"
                value={flowGradient.grain || 0}
                min={0}
                max={0.25}
                step={0.01}
                onChange={(v) => setFlowGradient({ grain: v })}
            />

        </Section>
    )
}
