

interface ColorPickerProps {
    label: string
    value: string
    onChange: (val: string) => void
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#CCC', fontFamily: 'Inter, sans-serif' }}>
            <span>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>{value}</span>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        padding: 0,
                        background: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}
                />
            </div>
        </div>
    )
}
