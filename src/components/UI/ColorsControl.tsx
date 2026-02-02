import { useStore } from '../../store'

import Section from './inputs/Section'
import ColorRow from './inputs/ColorRow'

export default function ColorsControl() {
    const {
        scene,
        gradient, setGradient,
        liquidMetal, setLiquidMetal,
        cubicGlass, setCubicGlass,
        lava, setLava,
        fluid, setFluid,
        ripples, setRipples,
        blob, setBlob,
        orbs, setOrbs,
        glow, setGlow,
        flowGradient, setFlowGradient,
        intelligenceGlow, setIntelligenceGlow
    } = useStore()

    const mode = scene.bgMode



    // Helper for Liquid Metal / Cubic (Array based)
    const renderArrayColors = (
        colors: string[],
        setFn: (val: { colors: string[] }) => void,
        max: number = 4
    ) => {
        const update = (i: number, c: string) => {
            const n = [...colors]; n[i] = c; setFn({ colors: n })
        }
        const add = () => { if (colors.length < max) setFn({ colors: [...colors, '#ffffff'] }) }
        const remove = (i: number) => {
            if (colors.length > 1) {
                const n = [...colors]; n.splice(i, 1); setFn({ colors: n })
            }
        }

        return (
            <>
                {colors.map((c, i) => (
                    <ColorRow
                        key={i}
                        label={`Color ${i + 1}`}
                        value={c}
                        onChange={(v) => update(i, v)}
                        onRemove={() => remove(i)}
                        canRemove={colors.length > 1}
                    />
                ))}
                {colors.length < max && (
                    <button onClick={add} style={{ width: '100%', marginTop: '8px', marginBottom: '16px', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '10px', borderRadius: '4px', cursor: 'pointer' }}>+ ADD COLOR</button>
                )}
            </>
        )
    }

    // Helper for Fixed 4 Colors (Gradient, Fluid, Flow, Orbs)
    // REMOVE LOGIC: Shift colors up, fill last with Black (#000000)
    const renderFixed4 = (
        state: any,
        setFn: (val: any) => void
    ) => {
        const remove = (idx: number) => {
            // Colors: 1, 2, 3, 4. Indices 0, 1, 2, 3.
            // If remove 1 (idx 0): 1<-2, 2<-3, 3<-4, 4<-#000000
            const colors = [state.color1, state.color2, state.color3, state.color4]
            colors.splice(idx, 1) // Remove item
            colors.push('#000000') // Add black at end

            setFn({
                color1: colors[0],
                color2: colors[1],
                color3: colors[2],
                color4: colors[3]
            })
        }

        return (
            <>
                <ColorRow label="Color 1" value={state.color1} onChange={(v) => setFn({ color1: v })} onRemove={() => remove(0)} />
                <ColorRow label="Color 2" value={state.color2} onChange={(v) => setFn({ color2: v })} onRemove={() => remove(1)} />
                <ColorRow label="Color 3" value={state.color3} onChange={(v) => setFn({ color3: v })} onRemove={() => remove(2)} />
                <ColorRow label="Color 4" value={state.color4} onChange={(v) => setFn({ color4: v })} onRemove={() => remove(3)} />
                {state.background && (
                    <ColorRow label="Background" value={state.background} onChange={(v) => setFn({ background: v })} canRemove={false} />
                )}
            </>
        )
    }

    // Helper for Fixed 3 Colors (Lava)
    const renderFixed3 = (state: any, setFn: (val: any) => void) => {
        const remove = (idx: number) => {
            const colors = [state.color1, state.color2, state.color3]
            colors.splice(idx, 1)
            colors.push('#000000')

            setFn({
                color1: colors[0],
                color2: colors[1],
                color3: colors[2]
            })
        }

        return (
            <>
                <ColorRow label="Color 1" value={state.color1} onChange={(v) => setFn({ color1: v })} onRemove={() => remove(0)} />
                <ColorRow label="Color 2" value={state.color2} onChange={(v) => setFn({ color2: v })} onRemove={() => remove(1)} />
                <ColorRow label="Color 3" value={state.color3} onChange={(v) => setFn({ color3: v })} onRemove={() => remove(2)} />
                <ColorRow label="Background" value={state.background} onChange={(v) => setFn({ background: v })} canRemove={false} />
            </>
        )
    }

    const renderContent = () => {
        switch (mode) {
            case 'Gradient': return renderFixed4(gradient, setGradient)
            case 'Acid Trip': return renderFixed4(fluid, setFluid)
            case 'Flow Gradient': return renderFixed4(flowGradient, setFlowGradient)
            case 'Intelligence Glow': return renderFixed4(intelligenceGlow, setIntelligenceGlow)
            case 'Orbs': return renderFixed4(orbs, setOrbs)

            case 'Liquid Metal': return renderArrayColors(liquidMetal.colors, setLiquidMetal)
            case 'Cubic': return renderArrayColors(cubicGlass.colors, setCubicGlass)

            case 'Lava Lamp': return renderFixed3(lava, setLava)

            case 'Ripples': return (
                <>
                    <ColorRow label="Ripple Color" value={ripples.color} onChange={(v) => setRipples({ color: v })} canRemove={false} />
                    <ColorRow label="Background" value={ripples.backgroundColor} onChange={(v) => setRipples({ backgroundColor: v })} canRemove={false} />
                </>
            )

            case 'Blob Stack': return (
                <>
                    <button
                        onClick={() => {
                            const b1 = blob.blob1
                            const b2 = blob.blob2
                            setBlob({ blob1: b2, blob2: b1 })
                        }}
                        style={{
                            width: '100%',
                            // marginBottom: '8px',
                            background: 'transparent',
                            border: '1px dashed rgba(255,255,255,0.2)',
                            color: 'rgba(255,255,255,0.6)',
                            padding: '4px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '9px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        SWAP LAYERS
                    </button>
                    <ColorRow label="Blob 1 (Top)" value={blob.blob1.color} onChange={(v) => setBlob({ blob1: { ...blob.blob1, color: v } })} onRemove={() => setBlob({ blob1: { ...blob.blob1, color: '#000000' } })} />
                    <ColorRow label="Blob 2 (Bottom)" value={blob.blob2.color} onChange={(v) => setBlob({ blob2: { ...blob.blob2, color: v } })} onRemove={() => setBlob({ blob2: { ...blob.blob2, color: '#000000' } })} />
                    <ColorRow label="Background" value={blob.background.color} onChange={(v) => setBlob({ background: { ...blob.background, color: v } })} canRemove={false} />
                </>
            )

            case 'Solid + Glow': return (
                <>
                    <ColorRow label="Glow 1" value={glow.color1} onChange={(v) => setGlow({ color1: v })} onRemove={() => setGlow({ color1: '#000000' })} />
                    <ColorRow label="Glow 2" value={glow.color2} onChange={(v) => setGlow({ color2: v })} onRemove={() => setGlow({ color2: '#000000' })} />
                    <ColorRow label="Background" value={scene.solidColor} onChange={(v) => useStore.getState().setScene({ solidColor: v })} canRemove={false} />
                </>
            )

            case 'Linear Gradient': return <div style={{ opacity: 0.5, fontSize: '11px', padding: '8px' }}>Use Advanced Controls below for Gradient Stops</div>

            default: return null
        }
    }

    if (mode === 'Linear Gradient') return null

    return (
        <Section title="Colors">
            <button
                onClick={useStore.getState().randomizeColors}
                style={{
                    width: '100%',
                    // marginBottom: '16px', // Removed redundant margin
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600
                }}
            >
                RANDOMIZE COLORS
            </button>
            {renderContent()}
        </Section>
    )
}
