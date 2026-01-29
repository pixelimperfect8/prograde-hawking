import ColorPicker from './ColorPicker'

interface ColorRowProps {
    label: string
    value: string
    onChange: (val: string) => void
    onRemove?: () => void
    canRemove?: boolean
}

export default function ColorRow({
    label,
    value,
    onChange,
    onRemove,
    canRemove = true
}: ColorRowProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1 }}>
                <ColorPicker label={label} value={value} onChange={onChange} />
            </div>
            {canRemove && onRemove && (
                <button
                    onClick={onRemove}
                    style={{
                        marginBottom: '4px',
                        padding: '3px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        lineHeight: 0,
                        height: '18px',
                        width: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        marginLeft: '4px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,50,50,0.1)'
                        e.currentTarget.style.borderColor = 'rgba(255,50,50,0.3)'
                        e.currentTarget.style.color = 'rgba(255,50,50,0.8)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                    }}
                    title="Remove Color"
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </div>
    )
}
