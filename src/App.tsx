import { Canvas } from '@react-three/fiber'
import React, { useRef } from 'react'
import { View } from '@react-three/drei'
import SceneContent from './components/SceneContent'
import Overlay from './components/UI/Overlay'
import CustomCursor from './components/UI/CustomCursor'
import LandingPage from './components/UI/LandingPage'

import { useStore } from './store'
import './index.css'

function UI() {
  const { logo, setLogo } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  /* isReady logic moved to global App state checks */

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

  return (
    <>
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
        {logo && (
          <img
            src={logo}
            alt="Brand Logo"
            style={{
              maxWidth: '80vw',
              maxHeight: '60vh',
              objectFit: 'contain',
              mixBlendMode: 'overlay',
              filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.3))'
            }}
          />
        )}
      </div>
    </>
  )
}

import PersistentLogo from './components/UI/PersistentLogo'

function App() {
  // Check if we're in embed mode
  const isEmbed = new URLSearchParams(window.location.search).get('embed') === 'true'

  const { export: exportState, appState } = useStore()
  const isRecording = exportState.isRecording

  // Container ref for event sourcing (so Canvas events work on scrolled content)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* DEBUG OVERLAY */}
      {/* 1. LAYOUT LAYER (Landing Page vs Main) */}

      {/* 2. UI LAYER (Controls, Cursor) only when Ready */}
      {!isEmbed && appState === 'ready' && <Overlay />}
      {!isEmbed && <CustomCursor />}
      {!isEmbed && <PersistentLogo />}
      {!isEmbed && appState === 'ready' && <UI />}

      {/* 3. APP CONTAINER STYLE (Resizing for Export) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        // Export Logic: Force dimensions if recording specific resolution
        width: (isRecording && exportState.resolution === '1080p') ? '1920px' :
          (isRecording && exportState.resolution === '4k') ? '3840px' : '100%',

        height: (isRecording && exportState.resolution === '1080p') ? '1080px' :
          (isRecording && exportState.resolution === '4k') ? '2160px' : '100%',

        zIndex: 0,
        pointerEvents: (appState === 'intro') ? 'none' : 'auto' // Let clicks pass through canvas in intro? No, canvas is background. 
        // Actually for View to work, canvas needs to receive events.
        // We set eventSource on Canvas to containerRef.
      }}>
        <Canvas
          eventSource={containerRef as any}
          className="canvas"
          // optimize: no depth/stencil needed for these 2D shaders usually -> faster capture
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false, depth: false, stencil: false }}
          dpr={isRecording ? 1 : [1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          <color attach="background" args={['#000']} />

          {/* A. View Portals (Thumbnails will render here) */}
          <View.Port />

          {/* B. Main Scene (Only when ready) */}
          <React.Suspense fallback={null}>
            <SceneContent />
          </React.Suspense>

        </Canvas>
      </div>

      {/* 4. LANDING PAGE OVERLAY (Moved to end for Z-Index priority) */}
      {(appState === 'intro' || appState === 'animating') && !isEmbed && <LandingPage />}
    </div>
  )
}

export default App
