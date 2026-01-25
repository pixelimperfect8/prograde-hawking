import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import MeshGradient from './components/MeshGradient'
import GlassOverlay from './components/Effects/GlassOverlay'
import GlowOverlay from './components/Effects/GlowOverlay'
import LavaLamp from './components/Effects/LavaLamp'
import BlobStack from './components/Effects/BlobStack'
import PostFX from './components/Effects/PostFX'
import Ticker from './components/Ticker'
import Overlay from './components/UI/Overlay'
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
    const factor = 1.5

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
      <group scale={[1.1, 1.1, 1]}>
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

        {showGlass && <GlassOverlay />}
      </group>
      <PostFX />
    </>
  )
}

function UI() {
  const { logo, setLogo } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const download = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = 'meshit-' + Date.now() + '.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

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
          <h1 style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            color: '#FBFF00',
            fontSize: 'clamp(4rem, 7.2vw, 13rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            textAlign: 'center',
            mixBlendMode: 'overlay',
          }}>
            MESHIT
          </h1>
        )}
      </div>

      <Ticker />

      <div style={{
        position: 'absolute',
        bottom: 40,
        right: 40,
        zIndex: 10
      }}>
        <button
          onClick={download}
          className="glass-btn"
          style={{
            padding: '12px 24px',
            fontSize: '0.9rem',
            background: 'rgba(0,0,0,0.5)',
            borderColor: 'rgba(255,255,255,0.2)'
          }}
        >
          Download Image
        </button>
      </div>
    </>
  )
}

function App() {
  return (
    <>
      <Overlay />

      {/* Leva Removed */}

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Canvas
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          dpr={[1, 2]}
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          <color attach="background" args={['#000']} />
          <Scene />
        </Canvas>
      </div>

      <UI />
    </>
  )
}

export default App
