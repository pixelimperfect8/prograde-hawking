

interface SwitchProps {
    label: string
    checked: boolean
    onChange: (val: boolean) => void
}

export default function Switch({ label, checked, onChange }: SwitchProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '6px' }}>
            <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: 'rgba(251, 255, 0, 0.76)',
            }}>
                {label}
            </span>

            <button
                onClick={() => onChange(!checked)}
                style={{
                    width: '43px',
                    height: '24px',
                    background: 'rgba(0, 0, 0, 0.32)',
                    borderRadius: '2px',
                    position: 'relative',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: checked ? '22px' : '3px',
                    width: '18px',
                    height: '18px',
                    background: checked ? 'rgba(251, 255, 0, 0.76)' : '#444',
                    borderRadius: '2px',
                    transition: 'left 0.2s, background 0.2s',
                    boxShadow: 'none'
                }} />
            </button>
        </div>
    )
}
