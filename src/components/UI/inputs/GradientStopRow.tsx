
import ColorPicker from './ColorPicker'

interface GradientStopRowProps {
    id: string
    color: string
    pos: number
    opacity: number
    selected: boolean
    onSelect: () => void
    onChange: (partial: Partial<{ color: string, pos: number, opacity: number }>) => void
    onRemove: () => void
    canRemove: boolean
}

export default function GradientStopRow({
    color,
    pos,
    opacity,
    selected,
    onSelect,
    onChange,
    onRemove,
    canRemove
}: GradientStopRowProps) {
    return (
        <div
            onClick={onSelect}
            style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '6px',
                marginBottom: '4px',
                background: selected ? 'rgba(255,255,255,0.03)' : 'transparent',
                borderRadius: '4px',
                padding: '4px',
                border: selected ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                transition: 'all 0.2s'
            }}
        >
            {/* Position Input */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '9px', color: '#666', marginBottom: '2px', textTransform: 'uppercase' }}>Pos</label>
                <div style={{ position: 'relative', width: '36px' }}>
                    <input
                        type="number"
                        value={Math.round(pos * 100)}
                        onChange={(e) => {
                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                            onChange({ pos: val / 100 })
                        }}
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            color: '#fff',
                            fontSize: '11px',
                            padding: '4px 2px',
                            textAlign: 'center',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Color Picker (Flex expands) */}
            <div style={{ flex: 1 }}>
                <ColorPicker
                    label="Color"
                    value={color}
                    onChange={(v) => onChange({ color: v })}
                />
            </div>

            {/* Opacity Input */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '9px', color: '#666', marginBottom: '2px', textTransform: 'uppercase' }}>Alpha</label>
                <div style={{ position: 'relative', width: '36px' }}>
                    <input
                        type="number"
                        value={Math.round(opacity * 100)}
                        onChange={(e) => {
                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                            onChange({ opacity: val / 100 })
                        }}
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            color: '#fff',
                            fontSize: '11px',
                            padding: '4px 2px',
                            textAlign: 'center',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Remove Button */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', paddingBottom: '5px' }}>
                {canRemove && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onRemove()
                        }}
                        style={{
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
                        title="Remove Stop"
                    >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}
