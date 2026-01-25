

interface SelectProps {
    label: string
    value: string
    options: string[]
    onChange: (val: string) => void
}

export default function Select({ label, value, options, onChange }: SelectProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#AAA', fontFamily: 'Inter, sans-serif' }}>{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#EEE',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer'
                }}
            >
                {options.map(opt => (
                    <option key={opt} value={opt} style={{ background: '#222' }}>{opt}</option>
                ))}
            </select>
        </div>
    )
}
