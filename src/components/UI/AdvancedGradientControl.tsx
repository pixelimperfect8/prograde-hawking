import { useStore } from '../../store'
import Section from './inputs/Section'
import Slider from './inputs/Slider'
import Select from './inputs/Select'
import ColorPicker from './inputs/ColorPicker'
// Simple ID gen if UUID not available in environment
const generateId = () => Math.random().toString(36).substr(2, 9)

export default function AdvancedGradientControl() {
    const { advancedGradient, setAdvancedGradient } = useStore()
    const { stops, angle, animation, speed, roughness } = advancedGradient

    // Sort stops just for display order? 
    // Actually, user wants to re-arrange. 
    // But logically, gradient stops MUST be ordered by position for the shader interpolation to work linearly.
    // Wait, standard gradients (CSS) allow stops to be out of order? No, they usually sort by % internally.
    // BUT the user asked to "re-arrange the colors".
    // If we have Red at 0% and Blue at 100%, and "re-arrange", maybe they mean swap Red to 100% and Blue to 0%?
    // OR swap the logical order in the array?
    // If I swap logical order: 
    // Stop 0: Blue at 0%
    // Stop 1: Red at 100%
    // The shader iterates 0 to N. It expects stops to be sorted by position to find interval.
    // SO, if I just swap array indices but keep positions, it might break searching interval if I don't sort before sending to shader.
    // My shader does: "We assume stops are sorted".
    // So the UI should manage the `pos` value.
    // "Re-arrange" usually means changing the order in the list.
    // If I drag Item 1 (Red) below Item 2 (Blue), usually that implies swapping their positions?
    // OR swapping their colors?
    // Let's implement robust "Move Up / Move Down" that swaps the entire Stop object (Color + ID) but *keeps* the Position? 
    // Or Swaps Positions?
    // If I swap Stop A (pos 0) and Stop B (pos 0.5):
    // Result: Stop B is at pos 0, Stop A is at pos 0.5.
    // This effectively swaps the colors at those positions.
    // This seems most intuitive for 're-arranging'.

    const updateStop = (id: string, partial: Partial<{ color: string, pos: number }>) => {
        const newStops = stops.map(s => s.id === id ? { ...s, ...partial } : s)
        // Sort by position? No, let the user adjust manually. 
        // But shader needs sorted.
        // Actually, if user puts 80% before 20% in the list, the shader logic "t <= uStops[0]" etc relies on order.
        // I should probably AUTO-SORT by position before sending to shader? I did that in the component: "const sorted = [...stops].sort(...)".
        // So the Array Order in Store doesn't theoretically matter for rendering, ONLY for UI list order.
        // But if UI list order is independent of Position, it gets confusing.
        // A "Stop List" usually is ordered by Position.
        // If the user wants to "Re-arrange", they likely mean changing the position logic.
        // Let's strictly enforce list order == position order?
        // NO, user asked for "re-arrange" explicitly.
        // Maybe they want the controls to be re-ordered?
        // Let's implement: List is sorted by Position automatically. 
        // "Re-arrange" -> "Swap Color". 
        // Wait, if I want 80/20.
        // Stop 1: 0.0
        // Stop 2: 0.8 (Color A)
        // Stop 3: 0.81 (Color B) ? Hard cut?
        // User said: "adjust the height of each color... if I want gradient to be 80/20". This implies controlling the Stop Position.

        setAdvancedGradient({ stops: newStops })
    }

    const addStop = () => {
        if (stops.length >= 10) return

        // Find a spot. Midpoint of last segment? Or just 0.5?
        // Smart placement
        const sorted = [...stops].sort((a, b) => a.pos - b.pos)
        let newPos = 0.5
        if (sorted.length >= 1) {
            const last = sorted[sorted.length - 1]
            if (last.pos < 1.0) newPos = 1.0
            else newPos = last.pos // Duplicate last?

            // Try to find a gap?
            // Simplest: Add at 0.5 or 1.0
            newPos = 0.5
        }

        const newStop = {
            id: generateId(),
            color: '#ffffff',
            pos: newPos
        }

        setAdvancedGradient({ stops: [...stops, newStop] })
    }

    const removeStop = (id: string) => {
        if (stops.length <= 2) return
        setAdvancedGradient({ stops: stops.filter(s => s.id !== id) })
    }

    // Move Stop Up/Down in the array index (Swapping colors effectively if we assume sort-by-pos for rendering)
    // Actually since we sort by pos in shader, the array index in store doesn't affect render order.
    // Changing array index only changes UI order. 
    // To "Re-arrange" the gradient visually, we must swap POSITIONS.
    // Let's provide "Swap Position with Next/Prev" buttons?
    // Or just simple Position Sliders and let them handle it.

    // User asked "allow to re-arrange the colors".
    // I will Sort the UI list by Position automatically.
    // If they change Position slider, the item might jump in the list.
    // That's standard gradient editor behavior (e.g. Photoshop).

    // BUT user asked "allow to re-arrange". Maybe they want to drag the color A to position of color B?
    // Swapping positions seems valid.

    // Let's implement: Sort UI by Position.
    // Add Stop.
    // Remove Stop.
    // Position Slider.

    // Wait, "re-arrange" might mean "I put Red first, Blue second... wait I want Blue first".
    // Changing positions accomplishes this.
    // I will trust that Position Sliders + Auto-Sort is the best specific solution.

    const sortedStops = [...stops].sort((a, b) => a.pos - b.pos)

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Gradient Stops</div>
                    {stops.length < 10 && (
                        <button
                            onClick={addStop}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.6)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px',
                                textTransform: 'uppercase'
                            }}
                        >
                            + Add
                        </button>
                    )}
                </div>

                {sortedStops.map((stop, i) => (
                    <div key={stop.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <ColorPicker
                                    label={`Stop ${i + 1}`}
                                    value={stop.color}
                                    onChange={(val) => updateStop(stop.id, { color: val })}
                                />
                            </div>
                            <button
                                onClick={() => removeStop(stop.id)}
                                disabled={stops.length <= 2}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: stops.length <= 2 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    cursor: stops.length <= 2 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px'
                                }}
                            >
                                -
                            </button>
                        </div>
                        <Slider
                            label="Position %"
                            value={Math.round(stop.pos * 100)}
                            min={0}
                            max={100}
                            step={1}
                            onChange={(val) => updateStop(stop.id, { pos: val / 100 })}
                        />
                    </div>
                ))}
            </div>

            <Section title="Settings">
                <Slider
                    label="Angle"
                    value={angle}
                    min={0}
                    max={360}
                    step={1}
                    onChange={(val) => setAdvancedGradient({ angle: val })}
                />

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
                    label="Roughness (Frosted)"
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
