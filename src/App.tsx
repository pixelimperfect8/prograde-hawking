import { Canvas, useFrame } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import * as THREE from 'three'
import MeshGradient from './components/MeshGradient'
import GlassOverlay from './components/Effects/GlassOverlay'
import GlowOverlay from './components/Effects/GlowOverlay'
import LavaLamp from './components/Effects/LavaLamp'
import BlobStack from './components/Effects/BlobStack'
import PostFX from './components/Effects/PostFX'
import Ticker from './components/Ticker'
import './index.css'

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
  const { showGlass, bgMode, solidColor } = useControls('Scene', {
    showGlass: true,
    bgMode: {
      options: ['Gradient', 'Solid + Glow', 'Lava Lamp', 'Blob Stack'],
      value: 'Gradient'
    },
    solidColor: {
      value: '#a3b48b', // Updated to Sage Green
      render: (get) => get('Scene.bgMode') === 'Solid + Glow'
    }
  })

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
          Download
        </button>
      </div>
    </>
  )
}

function App() {
  return (
    <>
      <Leva
        collapsed={false}
        flat
        titleBar={{ drag: true, title: 'Controls' }}
        theme={{
          sizes: {
            rootWidth: '360px',
            controlWidth: '160px',
          },
          colors: {
            elevation1: '#151515',
            elevation2: '#1f1f1f',
            elevation3: '#2a2a2a',
            accent1: '#FBFF00',
            accent2: '#888888',
            accent3: '#555555',
            highlight1: '#cccccc',
            highlight2: '#aaaaaa',
            highlight3: '#FBFF00',
            vivid1: '#FBFF00',
          },
          radii: {
            xs: '2px',
            sm: '4px',
            lg: '8px',
          },
          space: {
            rowGap: '8px',
            colGap: '8px',
          },
          fonts: {
            mono: `'Inter', monospace`,
            sans: `'Inter', sans - serif`,
          }
        }}
      />

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
