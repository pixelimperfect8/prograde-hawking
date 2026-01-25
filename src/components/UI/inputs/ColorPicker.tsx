

interface ColorPickerProps {
    label: string
    value: string
    onChange: (val: string) => void
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '26px' }}>
            <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: 'rgba(251, 255, 0, 0.76)',
                textTransform: 'uppercase'
            }}>
                {label}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '24px',
                    height: '24px',
                    background: value,
                    borderRadius: '2px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={{
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            opacity: 0,
                            cursor: 'pointer'
                        }}
                    />
                </div>

                <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#FBFF00',
                    width: '70px',
                    textAlign: 'right'
                }}>
                    {value}
                </span>
            </div>
        </div>
    )
}
