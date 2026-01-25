

interface SelectProps {
    label: string
    value: string
    options: string[]
    onChange: (val: string) => void
}

export default function Select({ label, value, options, onChange }: SelectProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginBottom: '6px' }}>
            <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: 'rgba(251, 255, 0, 0.76)',
                marginBottom: '4px'
            }}>
                {label}
            </span>

            <div style={{ position: 'relative', width: '156px' }}>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#FBFF00',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        textAlign: 'right',
                        paddingRight: '30px',
                        paddingBottom: '4px',
                        borderBottom: '1px solid rgba(251, 255, 0, 0.15)'
                    }}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt} style={{ background: '#222', color: '#FFF' }}>{opt}</option>
                    ))}
                </select>

                <div style={{ position: 'absolute', right: 0, bottom: '6px', pointerEvents: 'none' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 15L7 10H17L12 15Z" fill="#FBFF00" /></svg>
                </div>
            </div>
        </div>
    )
}
