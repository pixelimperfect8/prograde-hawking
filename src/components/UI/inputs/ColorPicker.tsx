

interface ColorPickerProps {
    label: string
    value: string
    onChange: (val: string) => void
}

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value.toUpperCase()
        // If it's a generic text change, we pass it up, but the parent
        // or a validation logic should ideally handle it.
        // For now, we'll let them type, but only "apply" strictly valid hexes if needed?
        // Actually, let's just update parent. 
        onChange(newVal)
    }

    const handleBlur = () => {
        // Simple validation: ensure it starts with # and is 7 chars
        if (!/^#[0-9A-F]{6}$/i.test(value)) {
            // If invalid, maybe don't revert? Or revert to a safe fallback?
            // Since we don't store "last valid", we accept user input but the color picker might break visuals.
            // Let's ensure at least it has a hash.
            if (!value.startsWith('#')) {
                onChange('#' + value)
            }
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '0.02em'
            }}>
                {label}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Circle Picker Swatch */}
                <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: value, // If value is invalid hex, this might default to transparent or black
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                }}>
                    <input
                        type="color"
                        value={value.length === 7 ? value : '#000000'} // Safe fallback for color input
                        onChange={(e) => onChange(e.target.value.toUpperCase())}
                        style={{
                            opacity: 0,
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            cursor: 'pointer'
                        }}
                    />
                </div>

                {/* Hex Text Input */}
                <input
                    type="text"
                    value={value}
                    onChange={handleHexChange}
                    spellCheck={false}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        width: '56px',
                        textAlign: 'right',
                        outline: 'none',
                        padding: '0',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)'}
                    onBlur={(e) => {
                        handleBlur()
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                    }}
                />
            </div>
        </div>
    )
}
