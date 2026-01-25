

interface SliderProps {
    label: string
    value: number
    min: number
    max: number
    step?: number
    onChange: (val: number) => void
}

export default function Slider({ label, value, min, max, step = 0.01, onChange }: SliderProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#AAA', fontFamily: 'Inter, sans-serif' }}>
                <span>{label}</span>
                <span>{value.toFixed(2)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={{
                    width: '100%',
                    accentColor: '#4facfe',
                    cursor: 'pointer',
                    height: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px',
                    appearance: 'auto' // Keep native for now for simplicity, can style deeper later
                }}
            />
        </div>
    )
}
