

interface SelectProps {
    label: string
    value: string
    options: string[]
    onChange: (val: string) => void
}

export default function Select({ label, value, options, onChange }: SelectProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
            }}>
                {label}
            </span>

            <div style={{ position: 'relative', width: 'auto' }}>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        appearance: 'none',
                        background: 'transparent',
                        border: 'none',
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        textAlign: 'right',
                        paddingRight: '18px',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt} style={{ background: '#111', color: '#FFF' }}>{opt}</option>
                    ))}
                </select>

                <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                    {/* Minimal chevron down */}
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
            </div>
        </div>
    )
}
