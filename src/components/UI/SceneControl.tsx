import { useState } from 'react'
import { useStore } from '../../store'
import Section from './inputs/Section'
import Select from './inputs/Select'
import ColorPicker from './inputs/ColorPicker'
import Switch from './inputs/Switch'
import ExportPanel from './ExportPanel'

export default function SceneControl() {
    const { scene, glass, setScene, setGlass } = useStore()
    const [showExport, setShowExport] = useState(false)

    return (
        <>
            {showExport && <ExportPanel onClose={() => setShowExport(false)} />}
            <Section title="Scene">
                <Select
                    label="Background Mode"
                    value={scene.bgMode}
                    options={['Gradient', 'Solid + Glow', 'Lava Lamp', 'Blob Stack', 'Orbs', 'Acid Burn']}
                    onChange={(val) => setScene({ bgMode: val as any })}
                />

                {scene.bgMode === 'Solid + Glow' && (
                    <ColorPicker
                        label="Solid Color"
                        value={scene.solidColor}
                        onChange={(val) => setScene({ solidColor: val })}
                    />
                )}

                <Switch
                    label="Glass Overlay"
                    checked={glass.enabled}
                    onChange={(val) => setGlass({ enabled: val })}
                />

                {/* Global Export Button */}
                <button
                    onClick={() => setShowExport(true)}
                    style={{
                        width: '100%',
                        marginTop: '16px',
                        background: 'transparent',
                        border: '1px solid rgba(0, 153, 255, 0.3)',
                        color: 'rgba(0, 153, 255, 0.8)',
                        padding: '10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 153, 255, 0.6)'
                        e.currentTarget.style.color = '#0099ff'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 153, 255, 0.3)'
                        e.currentTarget.style.color = 'rgba(0, 153, 255, 0.8)'
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export
                </button>
            </Section>
        </>
    )
}
