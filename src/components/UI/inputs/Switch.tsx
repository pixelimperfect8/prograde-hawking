

interface SwitchProps {
    label: string
    checked: boolean
    onChange: (val: boolean) => void
}

export default function Switch({ label, checked, onChange }: SwitchProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#CCC', fontFamily: 'Inter, sans-serif' }}>
            <span>{label}</span>
            <button
                onClick={() => onChange(!checked)}
                style={{
                    width: '36px',
                    height: '20px',
                    background: checked ? '#4facfe' : 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    position: 'relative',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: checked ? '18px' : '2px',
                    width: '16px',
                    height: '16px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} />
            </button>
        </div>
    )
}
