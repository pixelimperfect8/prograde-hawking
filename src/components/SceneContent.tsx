/* React import removed */
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

import MeshGradient from './MeshGradient'
import GlassOverlay from './Effects/GlassOverlay'
import GlowOverlay from './Effects/GlowOverlay'
import LavaLamp from './Effects/LavaLamp'
import BlobStack from './Effects/BlobStack'
import Orbs from './Effects/Orbs'
import AcidTrip from './Effects/AcidTrip'
import Ripples from './Effects/Ripples'
import AdvancedGradient from './Effects/AdvancedGradient'
import LiquidMetal from './Effects/LiquidMetal'
import CubicGlass from './Effects/CubicGlass'
import FlowGradient from './Effects/FlowGradient'
import IntelligenceGlow from './Effects/IntelligenceGlow'
import PatternOverlay from './Effects/Overlay'
import PostFX from './Effects/PostFX'

function Rig() {
    useFrame((state) => {
        // Read mouse position (-1 to 1)
        const x = state.mouse.x
        const y = state.mouse.y

        // Parallax Factor
        const factor = 0.5

        // Smooth lerp for fluid movement
        state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x * factor, 0.05)
        state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, y * factor, 0.05)
        state.camera.lookAt(0, 0, 0)
    })
    return null
}

export default function SceneContent() {
    const { scene, glass } = useStore()
    const { bgMode, solidColor } = scene
    const showGlass = glass.enabled

    return (
        <>
            {bgMode !== '3D Gradient' && <Rig />}
            {/* Scale up mesh slightly to cover edges during camera movement */}
            <group scale={[1.25, 1.25, 1]}>
                {bgMode === 'Gradient' && <MeshGradient />}

                {bgMode === 'Solid + Glow' && (
                    <>
                        <mesh scale={[10, 10, 1]} position={[0, 0, -0.1]}>
                            <planeGeometry args={[1, 1]} />
                            <meshBasicMaterial color={solidColor} />
                        </mesh>
                        <GlowOverlay />
                    </>
                )}

                {bgMode === 'Lava Lamp' && <LavaLamp />}
                {bgMode === 'Blob Stack' && <BlobStack />}
                {bgMode === 'Orbs' && <Orbs />}
                {bgMode === 'Acid Trip' && <AcidTrip />}
                {bgMode === 'Ripples' && <Ripples />}

                {/* Dynamic Backgrounds */}
                {bgMode === 'Liquid Metal' && <LiquidMetal />}
                {bgMode === 'Cubic' && <CubicGlass />}
                {bgMode === 'Linear Gradient' && <AdvancedGradient />}
                {bgMode === 'Flow Gradient' && <FlowGradient />}
                {bgMode === 'Intelligence Glow' && <IntelligenceGlow />}

                {/* Overlays (Except for Cubic which is its own 3D scene) */}
                {(bgMode !== 'Cubic') && <PatternOverlay />}

                {showGlass && <GlassOverlay />}
            </group>
            <PostFX />
        </>
    )
}
