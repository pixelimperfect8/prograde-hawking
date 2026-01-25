


interface ColorPickerProps {
    label: string
    value: string
    onChange: (val: string) => void
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Circle Preview */}
                <div style={{
                    width: '16px',
                    height: '16px',
                    background: value,
                    borderRadius: '50%',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.2)'
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
                    fontSize: '12px',
                    color: '#FFFFFF',
                    width: '60px',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums'
                }}>
                    {value}
                </span>
            </div>
        </div>
    )
}
