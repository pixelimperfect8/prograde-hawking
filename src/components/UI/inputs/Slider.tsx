

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '6px' }}>
            {/* Label */}
            <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: 'rgba(251, 255, 0, 0.76)',
                textTransform: 'uppercase',
                width: '120px'
            }}>
                {label}
            </span>

            {/* Controls Container */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>

                {/* Slider Track Container */}
                <div style={{ position: 'relative', width: '100px', height: '13px', display: 'flex', alignItems: 'center' }}>

                    {/* Background Line */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        width: '100%',
                        height: '1px',
                        background: 'rgba(251, 255, 0, 0.15)',
                        border: 'none'
                    }} />

                    {/* Active Line */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        width: `${percentage}%`,
                        height: '1px',
                        background: '#FBFF00'
                    }} />

                    {/* Custom Thumb Input Overlay */}
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

                    {/* Visible Thumb (Rect) */}
                    <div style={{
                        position: 'absolute',
                        left: `calc(${percentage}% - 3px)`,
                        width: '6px',
                        height: '13px',
                        background: '#FBFF00',
                        pointerEvents: 'none'
                    }} />
                </div>

                {/* Value Display */}
                <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#FBFF00',
                    width: '40px',
                    textAlign: 'right'
                }}>
                    {value.toFixed(2)}
                </span>
            </div>
        </div>
    )
}
