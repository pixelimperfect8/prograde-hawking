import { useMemo } from 'react'
import { CanvasTexture } from 'three'

import LavaLamp from './Effects/LavaLamp'
import BlobStack from './Effects/BlobStack'
import Orbs from './Effects/Orbs'
import AcidTrip from './Effects/AcidTrip'
import Ripples from './Effects/Ripples'
import AdvancedGradient from './Effects/AdvancedGradient'
import LiquidMetal from './Effects/LiquidMetal'
import GlowOverlay from './Effects/GlowOverlay'
import FlowGradient from './Effects/FlowGradient'
import IntelligenceGlow from './Effects/IntelligenceGlow'
// Note: We intentionally skip PostFX and GlassOverlay for performance in thumbnails

interface ThumbnailSceneProps {
    mode: string
    color?: string // For Solid + Glow
}

export default function ThumbnailScene({ mode, color }: ThumbnailSceneProps) {
    // Create gradient texture once using useMemo
    const gradientTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);

        return new CanvasTexture(canvas);
    }, []);

    // Render simplified, low-performance versions for thumbnails
    // These use reduced geometry and simpler shaders

    return (
        <group scale={[1.0, 1.0, 1]}>
            {mode === 'Gradient' && gradientTexture && (
                <mesh scale={[10, 10, 1]}>
                    <planeGeometry args={[1, 1, 16, 16]} /> {/* Reduced from 64x64 */}
                    <meshBasicMaterial map={gradientTexture} />
                </mesh>
            )}

            {mode === 'Solid + Glow' && (
                <>
                    <mesh scale={[10, 10, 1]} position={[0, 0, -0.1]}>
                        <planeGeometry args={[1, 1]} />
                        <meshBasicMaterial color={color || '#000'} />
                    </mesh>
                    <GlowOverlay />
                </>
            )}

            {mode === 'Lava Lamp' && <LavaLamp />}
            {mode === 'Blob Stack' && <BlobStack />}
            {mode === 'Orbs' && <Orbs />}
            {mode === 'Acid Trip' && <AcidTrip />}
            {mode === 'Ripples' && <Ripples />}
            {mode === 'Liquid Metal' && <LiquidMetal />}
            {mode === 'Linear Gradient' && <AdvancedGradient />}
            {mode === 'Flow Gradient' && <FlowGradient />}
            {mode === 'Intelligence Glow' && <IntelligenceGlow />}
        </group>
    )
}
