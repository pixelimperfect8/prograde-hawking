import { Canvas, useFrame } from '@react-three/fiber'
import React, { useRef } from 'react'
import * as THREE from 'three'
import MeshGradient from './components/MeshGradient'
import GlassOverlay from './components/Effects/GlassOverlay'
import GlowOverlay from './components/Effects/GlowOverlay'
import LavaLamp from './components/Effects/LavaLamp'
import BlobStack from './components/Effects/BlobStack'
import Orbs from './components/Effects/Orbs'
import AcidTrip from './components/Effects/AcidTrip'
import Ripples from './components/Effects/Ripples'
import AdvancedGradient from './components/Effects/AdvancedGradient'
import LiquidMetal from './components/Effects/LiquidMetal'
import CubicGlass from './components/Effects/CubicGlass'
import FlowGradient from './components/Effects/FlowGradient'
import IntelligenceGlow from './components/Effects/IntelligenceGlow'
import PostFX from './components/Effects/PostFX'
import Overlay from './components/UI/Overlay'
import CustomCursor from './components/UI/CustomCursor'
import IntroMeshit from './components/UI/IntroMeshit'
// import BrandLogo from './components/UI/BrandLogo'
import { useStore } from './store'
import './index.css'

// Custom hook no longer needed
// function useLevaArrowFix() ...

function Rig() {
  useFrame((state) => {
    // Read mouse position (-1 to 1)
    // Move camera slightly towards mouse for perspective shift
    const x = state.mouse.x
    const y = state.mouse.y

    // Parallax Factor (how much camera moves)
    const factor = 0.5

    // Smooth lerp for fluid movement
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x * factor, 0.05)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, y * factor, 0.05)

    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function Scene() {
  const { scene, glass } = useStore()
  const { bgMode, solidColor } = scene
  const showGlass = glass.enabled

  return (
    <>
      <Rig />
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
        {bgMode === 'Linear Gradient' && <AdvancedGradient />}
        {bgMode === 'Liquid Metal' && <LiquidMetal />}
        {bgMode === 'Flow Gradient' && <FlowGradient />}
        {bgMode === 'Intelligence Glow' && <IntelligenceGlow />}


        {showGlass && <GlassOverlay />}
      </group>
      <PostFX />
    </>
  )
}

function UI() {
  const { logo, setLogo, appState } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isReady = appState === 'ready'

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogo(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  /* Leva Controls moved to custom UI */



  return (
    <>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/png, image/jpeg, image/svg+xml"
        style={{ display: 'none' }}
      />

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}>
        {logo ? (
          <img
            src={logo}
            alt="Brand Logo"
            style={{
              maxWidth: '80vw',
              maxHeight: '60vh',
              objectFit: 'contain',
              mixBlendMode: 'overlay', // Optional: Makes it blend cool like the text
              filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.3))'
            }}
          />
        ) : (
          <IntroMeshit />
        )}
      </div>

      <div style={{
        opacity: isReady ? 1 : 0,
        transition: 'opacity 1s ease 0.5s', // Delay to sync with controls
        pointerEvents: isReady ? 'auto' : 'none'
      }}>
        {/* <BrandLogo /> REMOVED as per user request */}
      </div>


    </>
  )
}

function App() {
  // Check if we're in embed mode
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true'


  return (
    <>
      {/* Only show UI controls when NOT in embed mode */}
      {!isEmbed && <Overlay />}
      {!isEmbed && <CustomCursor />}

      {/* Leva Removed */}

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Canvas
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          <color attach="background" args={['#000']} />
          <React.Suspense fallback={null}>
            <Scene />
          </React.Suspense>
        </Canvas>
      </div>

      {/* Only show UI overlay when NOT in embed mode */}
      {!isEmbed && <UI />}
    </>
  )
}

export default App
