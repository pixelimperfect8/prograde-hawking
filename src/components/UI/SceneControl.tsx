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
                    options={['Gradient', 'Solid + Glow', 'Lava Lamp', 'Blob Stack']}
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
                        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(0, 153, 255, 0.3))',
                        border: '1px solid rgba(138, 43, 226, 0.5)',
                        color: '#fff',
                        padding: '12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(138, 43, 226, 0.5), rgba(0, 153, 255, 0.5))'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(0, 153, 255, 0.3))'
                        e.currentTarget.style.transform = 'translateY(0)'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
