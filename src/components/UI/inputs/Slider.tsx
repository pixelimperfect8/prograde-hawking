

interface SliderProps {
    label: string
    value: number
    min: number
    max: number
    step?: number
    onChange: (val: number) => void
}

export default function Slider({ label, value, min, max, step = 0.01, onChange }: SliderProps) {
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)', // Subdued info
                }}>
                    {label}
                </span>
                <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: '#FFFFFF', // Value pops
                    fontVariantNumeric: 'tabular-nums'
                }}>
                    {value.toFixed(2)}
                </span>
            </div>

            {/* Slider Interaction Zone */}
            <div style={{ position: 'relative', width: '100%', height: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>

                {/* Background Track (Thin) */}
                <div style={{
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '1px'
                }} />

                {/* Active Track (Glow) */}
                <div style={{
                    position: 'absolute',
                    left: 0,
                    width: `${percentage}%`,
                    height: '2px',
                    background: '#FFFFFF',
                    borderRadius: '1px',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)' // Soft glow
                }} />

                {/* Input Overlay */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 2,
                        margin: 0
                    }}
                />

                {/* Minimal Thumb (Only visible on hover ideally, but always vis works too) */}
                <div style={{
                    position: 'absolute',
                    left: `calc(${percentage}% - 4px)`,
                    width: '8px',
                    height: '8px',
                    background: '#FFFFFF',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    boxShadow: '0 0 0 2px rgba(0,0,0,0.5)', // Contrast ring
                    transition: 'transform 0.1s'
                }} />
            </div>
        </div>
    )
}
