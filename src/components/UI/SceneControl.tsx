import { useState } from 'react'
import { useStore } from '../../store'
import Section from './inputs/Section'
import Select from './inputs/Select'
// import ColorPicker from './inputs/ColorPicker' // Removed, replaced by ColorsControl

import ExportPanel from './ExportPanel'
import ColorsControl from './ColorsControl'
import GeneralSettingsControl from './GeneralSettingsControl'
import EffectsControl from './EffectsControl' // Now contains Bloom, CRT, Vintage sections
import GlassControl from './GlassControl'
import OverlayControl from './OverlayControl'

import AdvancedGradientControl from './AdvancedGradientControl'
import LiquidMetalControl from './LiquidMetalControl'
import CubicGlassControl from './CubicGlassControl'
import LavaControl from './LavaControl'
import AcidTripControl from './AcidTripControl'
import RipplesControl from './RipplesControl'
import GradientControl from './GradientControl'
import BlobControl from './BlobControl'
import OrbsControl from './OrbsControl'
import GlowControl from './GlowControl'
import FlowGradientControl from './FlowGradientControl'
import IntelligenceGlowControl from './IntelligenceGlowControl'

function SavePanel() {
    const { presets, saveCreation, loadCreation, removeCreation } = useStore()
    const [expanded, setExpanded] = useState(false)
    const [name, setName] = useState('')

    const handleSave = () => {
        if (!name.trim()) return
        saveCreation(name)
        setName('')
        setExpanded(false)
    }

    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600,
                    marginBottom: '0px' // Handled by gap
                }}
            >
                Saved Creations
            </button>
        )
    }

    return (
        <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            padding: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Creation Name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        padding: '6px 8px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        outline: 'none'
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    autoFocus
                />
                <button
                    onClick={handleSave}
                    style={{
                        background: '#0099ff',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    SAVE
                </button>
            </div>

            {presets.creations.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                    {presets.creations.map((c) => (
                        <div key={c.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '3px',
                            fontSize: '11px'
                        }}>
                            <span
                                onClick={() => loadCreation(c.id)}
                                style={{
                                    cursor: 'pointer',
                                    color: '#ccc',
                                    flex: 1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#ccc'}
                            >
                                {c.name}
                            </span>
                            <button
                                onClick={() => removeCreation(c.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#666',
                                    cursor: 'pointer',
                                    padding: '2px 4px',
                                    fontSize: '14px',
                                    lineHeight: 1
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ff4444'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => setExpanded(false)}
                style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#888',
                    padding: '4px',
                    borderRadius: '3px',
                    fontSize: '9px',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                }}
            >
                Close Panel
            </button>
        </div>
    )
}

export default function SceneControl() {
    const { scene, setScene } = useStore()
    const [showExport, setShowExport] = useState(false)

    return (
        <>
            {showExport && <ExportPanel onClose={() => setShowExport(false)} />}

            {/* 1. SCENE CONTROLS (Mode + Export) */}
            <Section title="Scene Controls" isFirst={true}>
                <Select
                    label="Mode"
                    value={scene.bgMode}
                    options={['Gradient', 'Solid + Glow', 'Lava Lamp', 'Blob Stack', 'Orbs', 'Acid Trip', 'Ripples', 'Linear Gradient', 'Liquid Metal', 'Cubic', 'Flow Gradient', 'Intelligence Glow']}
                    onChange={(val) => {
                        setScene({ bgMode: val as any })
                    }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* SAVE CREATION */}
                    <SavePanel />

                    {/* EXPORT */}
                    <button
                        onClick={() => setShowExport(true)}
                        style={{
                            width: '100%',
                            background: 'rgba(0, 153, 255, 0.1)',
                            border: '1px solid rgba(0, 153, 255, 0.3)',
                            color: '#0099ff',
                            padding: '12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 153, 255, 0.2)'
                            e.currentTarget.style.borderColor = 'rgba(0, 153, 255, 0.6)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 153, 255, 0.1)'
                            e.currentTarget.style.borderColor = 'rgba(0, 153, 255, 0.3)'
                        }}
                    >
                        EXPORT
                    </button>
                </div>
            </Section>

            {/* 2. COLORS */}
            <ColorsControl />

            {/* 3. MODE SETTINGS (Unique Params Only) */}
            {/* NOTE: These components currently have Colors/Speed duplications. I will clean them up next. */}
            {(scene.bgMode === 'Linear Gradient') ? (
                <AdvancedGradientControl />
            ) : (
                <>
                    {scene.bgMode === 'Gradient' && <GradientControl />}
                    {scene.bgMode === 'Liquid Metal' && <LiquidMetalControl />}
                    {scene.bgMode === 'Cubic' && <CubicGlassControl />}
                    {scene.bgMode === 'Lava Lamp' && <LavaControl />}
                    {scene.bgMode === 'Acid Trip' && <AcidTripControl />}
                    {scene.bgMode === 'Ripples' && <RipplesControl />}
                    {scene.bgMode === 'Blob Stack' && <BlobControl />}
                    {scene.bgMode === 'Orbs' && <OrbsControl />}
                    {scene.bgMode === 'Flow Gradient' && <FlowGradientControl />}
                    {scene.bgMode === 'Intelligence Glow' && <IntelligenceGlowControl />}
                    {scene.bgMode === 'Solid + Glow' && <GlowControl />}
                </>
            )}

            {/* 4. GENERAL SETTINGS (Speed, Grain, Dither) */}
            <GeneralSettingsControl />

            {/* 5. EFFECTS (Bloom, CRT, Vintage) */}
            <EffectsControl />

            {/* 6. OVERLAY */}
            {(scene.bgMode !== 'Cubic') && <OverlayControl />}

            {/* 7. GLASS */}
            <GlassControl />
        </>
    )
}
