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
                        // marginTop: '16px' // Removed redundant margin handled by parent gap
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
