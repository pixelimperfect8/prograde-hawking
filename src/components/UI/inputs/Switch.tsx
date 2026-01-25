

interface SwitchProps {
    label: string
    checked: boolean
    onChange: (val: boolean) => void
}

export default function Switch({ label, checked, onChange }: SwitchProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
            <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
            }}>
                {label}
            </span>

            <button
                onClick={() => onChange(!checked)}
                style={{
                    width: '32px',
                    height: '18px',
                    background: checked ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px', // Full pill
                    position: 'relative',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'background 0.3s ease'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: checked ? '16px' : '2px',
                    width: '14px',
                    height: '14px',
                    background: checked ? '#000000' : '#FFFFFF', // Contrast: Black dot on White, White dot on Grey
                    borderRadius: '50%',
                    transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }} />
            </button>
        </div>
    )
}
