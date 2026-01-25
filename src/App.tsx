import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { Leva, useControls, button } from 'leva'
import * as THREE from 'three'
import MeshGradient from './components/MeshGradient'
import GlassOverlay from './components/Effects/GlassOverlay'
import GlowOverlay from './components/Effects/GlowOverlay'
import LavaLamp from './components/Effects/LavaLamp'
import BlobStack from './components/Effects/BlobStack'
import PostFX from './components/Effects/PostFX'
import Ticker from './components/Ticker'
import { useStore } from './store'
import './index.css'

// Custom hook to fix Leva folder arrow positions
function useLevaArrowFix() {
  useEffect(() => {
    const fixArrows = () => {
      // Find all buttons with SVGs (folder headers)
      const buttons = document.querySelectorAll('[class*="leva"] button')

      buttons.forEach((btn) => {
        const svg = btn.querySelector('svg')
        if (svg) {
          // This is a folder header button
          const button = btn as HTMLButtonElement
          button.style.display = 'flex'
          button.style.flexDirection = 'row'
          button.style.justifyContent = 'space-between'
          button.style.alignItems = 'center'
          button.style.width = '100%'

          // Physically move SVG to the end of the button (right side)
          if (button.lastElementChild !== svg) {
            button.appendChild(svg)
          }

          // Style SVG
          const svgEl = svg as SVGElement
          svgEl.style.marginLeft = 'auto'
          svgEl.style.marginRight = '0'
          svgEl.style.order = '2' // Just in case flex is used

          // Style Label (first child usually)
          const label = button.firstChild as HTMLElement
          if (label && label !== svg) {
            label.style.textAlign = 'left'
            label.style.order = '1'
            label.style.flex = '1'
          }
        }
      })
    }

    // Run initially after a small delay for Leva to render
    const timer = setTimeout(fixArrows, 100)

    // Also run on any DOM changes (for when folders expand/collapse)
    const observer = new MutationObserver(fixArrows)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])
}

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

  // Leva Controls for Logo
  useControls('Branding', {
    'Upload Logo': button(() => fileInputRef.current?.click()),
    'Remove Logo': button(() => setLogo(null)),
  }, [logo]) // Dep array to ensure it stays fresh if needed

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
  // Apply JS-based arrow position fix for Leva folders
  useLevaArrowFix()

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
          borderWidths: {
            folder: '0px', // Try to remove folder border lines
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
