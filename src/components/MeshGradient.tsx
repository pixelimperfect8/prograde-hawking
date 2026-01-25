import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { Color } from 'three'
import { shaderMaterial, Html } from '@react-three/drei'
import { useControls, button } from 'leva'
// We don't strictly need * as THREE if we don't use it in code, 
// but if we used it in types, we would.
// We are using 'any' for the component type to be safe.

// Simple noise function (Simplex Noise) or similar will be embedded
const GradientMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new Color('#ff0000'),
    uColor2: new Color('#00ff00'),
    uColor3: new Color('#0000ff'),
    uColor4: new Color('#ffff00'),
    uSpeed: 0.2,
    uNoiseDensity: 2.0,
    uNoiseStrength: 0.2,
    uKaleidoEnabled: 0.0,
    uKaleidoSegments: 6.0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    uniform float uSpeed;
    uniform float uNoiseDensity;
    uniform float uNoiseStrength;
    uniform float uKaleidoEnabled;
    uniform float uKaleidoSegments;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    vec2 kaleidoscope(vec2 uv, float segments) {
        vec2 centered = uv - 0.5;
        float r = length(centered);
        float a = atan(centered.y, centered.x);
        
        float segmentAngle = 3.14159 * 2.0 / segments;
        
        // Modulo angle for repetition
        a = mod(a, segmentAngle);
        
        // Mirror logic
        a = abs(a - segmentAngle/2.0);
        
        // Back to cartesian
        return vec2(cos(a), sin(a)) * r + 0.5;
    }

    void main() {
      vec2 uv = vUv;
      
      if (uKaleidoEnabled > 0.5) {
        uv = kaleidoscope(uv, uKaleidoSegments);
      }
      
      // Make it slow
      float time = uTime * uSpeed;
      
      // Create some moving noise for organic feel
      float noise1 = snoise(uv * uNoiseDensity + time);
      float noise2 = snoise(uv * (uNoiseDensity * 0.5) - time * 0.5);
      
      // Distort UVs slightly
      uv += noise1 * uNoiseStrength;
      
      // Mix colors based on position and noise
      // Top-Left to Bottom-Right roughly
      vec3 mix1 = mix(uColor1, uColor2, smoothstep(0.0, 1.0, uv.x + noise2 * 0.2));
      vec3 mix2 = mix(uColor3, uColor4, smoothstep(0.0, 1.0, uv.x - noise2 * 0.2));
      
      vec3 finalColor = mix(mix1, mix2, smoothstep(0.0, 1.0, uv.y + noise1 * 0.2));
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
)

extend({ GradientMaterial })

// Add types for the custom shader material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      gradientMaterial: any
    }
  }
}

const PRESETS = {
  'Calm': {
    color1: '#4facfe',
    color2: '#00f2fe',
    color3: '#a18cd1',
    color4: '#fbc2eb',
    speed: 0.1,
    noiseDensity: 1.2,
    noiseStrength: 0.2
  },
  'Neon': {
    color1: '#ff0055',
    color2: '#00ff99',
    color3: '#5500ff',
    color4: '#ffaa00',
    speed: 0.4,
    noiseDensity: 2.0,
    noiseStrength: 0.5
  },
  'Ocean': {
    color1: '#003366',
    color2: '#006699',
    color3: '#33cccc',
    color4: '#0099ff',
    speed: 0.15,
    noiseDensity: 0.8,
    noiseStrength: 0.3
  },
  'Sunset': {
    color1: '#ff4e50',
    color2: '#f9d423',
    color3: '#f12711',
    color4: '#f5af19',
    speed: 0.1,
    noiseDensity: 1.5,
    noiseStrength: 0.2
  },
  'Deep Space': {
    color1: '#0f2027',
    color2: '#203a43',
    color3: '#2c5364',
    color4: '#5c258d',
    speed: 0.05,
    noiseDensity: 2.5,
    noiseStrength: 0.1
  }
}

const TRENDY_PALETTES = [
  ['#FF9A9E', '#FECFEF', '#FFD1FF', '#FAD0C4'], // Cherry Blossom
  ['#a18cd1', '#fbc2eb', '#fad0c4', '#ffd1ff'], // Soft Lilac
  ['#84fab0', '#8fd3f4', '#a1c4fd', '#c2e9fb'], // Mint Sky
  ['#fccb90', '#d57eeb', '#e0c3fc', '#8ec5fc'], // Magic Hour
  ['#e0c3fc', '#8ec5fc', '#4facfe', '#00f2fe'], // Cold Blue
  ['#43e97b', '#38f9d7', '#2af598', '#22e4ac'], // Fresh Green
  ['#fa709a', '#fee140', '#ff9a9e', '#fecfef'], // Fruit Punch
  ['#30cfd0', '#330867', '#5f2c82', '#49a09d'], // Deep Teal/Purple
  ['#667eea', '#764ba2', '#6B8DD6', '#8E37D7'], // Plum
  ['#00c6fb', '#005bea', '#4facfe', '#00f2fe'], // Electric Blue
  ['#FA8BFF', '#2BD2FF', '#2BFF88', '#FFFF00'], // Neon Cyber
  // High Contrast / Pop
  ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'], // RGBY Primary
  ['#111111', '#FF0033', '#FFFFFF', '#00FFCC'], // Dark Cyber
  ['#FF5F6D', '#FFC371', '#2C3E50', '#FD746C'], // Coral vs Dark Blue
  ['#833ab4', '#fd1d1d', '#fcb045', '#000000'], // Instagram vs Void
  ['#000000', '#FFFFFF', '#FF0099', '#33CCFF'], // CMYK Vibes
  ['#2b5876', '#4e4376', '#F0F2F0', '#000DFF'], // Deep Navy vs White/Electric
  ['#AAFFA9', '#11FFBD', '#743477', '#B22222'], // Mint vs Deep Burgundy
  ['#FFD700', '#202020', '#FF0000', '#FFFFFF'], // Bauhaus (Yellow/Black/Red/White)
  ['#9D50BB', '#6E48AA', '#F3F9A7', '#CAC531'], // Purple vs Acid Green
]

import { generateMeshGradientCode } from '../utils/framerTemplates'

export default function MeshGradient() {
  const materialRef = useRef<any>(null)

  const [gradientConfig, setGradientConfig] = useControls('Gradient Settings', () => ({
    'Randomize Colors': button(() => {
      const randomPalette = TRENDY_PALETTES[Math.floor(Math.random() * TRENDY_PALETTES.length)]
      setGradientConfig({
        color1: randomPalette[0],
        color2: randomPalette[1],
        color3: randomPalette[2],
        color4: randomPalette[3],
        preset: 'Custom'
      })
    }),
    preset: {
      value: 'Neon', // Default is now Neon
      options: ['Custom', ...Object.keys(PRESETS)],
      onChange: (value) => {
        if (value !== 'Custom' && PRESETS[value as keyof typeof PRESETS]) {
          const p = PRESETS[value as keyof typeof PRESETS]
          setGradientConfig({
            color1: p.color1,
            color2: p.color2,
            color3: p.color3,
            color4: p.color4,
            speed: p.speed,
            noiseDensity: p.noiseDensity,
            noiseStrength: p.noiseStrength
          })
        }
      }
    },
    // DEFAULT VALUES UPDATED TO 'NEON' PRESET
    color1: '#ff0055',
    color2: '#00ff99',
    color3: '#5500ff',
    color4: '#ffaa00',
    speed: { value: 0.4, min: 0, max: 2 },
    noiseDensity: { value: 2.0, min: 0.1, max: 5 },
    noiseStrength: { value: 0.5, min: 0, max: 1 },
    wireframe: false,

    // Kaleidoscope Controls for the gradient itself
    kaleidoscope: false,
    kSegments: { value: 6, min: 2, max: 20, step: 1, render: (get) => get('Gradient Settings.kaleidoscope') }
  }))

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime()
    }
  })

  return (
    <mesh scale={[10, 10, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />
      {/* @ts-ignore */}
      <gradientMaterial
        ref={materialRef}
        uColor1={new Color(gradientConfig.color1)}
        uColor2={new Color(gradientConfig.color2)}
        uColor3={new Color(gradientConfig.color3)}
        uColor4={new Color(gradientConfig.color4)}
        uSpeed={gradientConfig.speed}
        uNoiseDensity={gradientConfig.noiseDensity}
        uNoiseStrength={gradientConfig.noiseStrength}
        uKaleidoEnabled={gradientConfig.kaleidoscope ? 1.0 : 0.0}
        uKaleidoSegments={gradientConfig.kSegments}
        wireframe={gradientConfig.wireframe}
      />
      <Html position={[0, -0.4, 0]} transform={false} style={{ pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', position: 'fixed', bottom: '20px', left: '20px', zIndex: 1000 }}>
          <button
            onClick={() => {
              const code = generateMeshGradientCode(gradientConfig)
              navigator.clipboard.writeText(code)
              alert('Framer Code Copied! (Verified Config)')
            }}
            style={{
              background: '#151515',
              color: '#FBFF00',
              border: '1px solid #333',
              padding: '8px 16px',
              fontFamily: 'Inter',
              fontSize: '12px',
              cursor: 'pointer',
              borderRadius: '4px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}
          >
            COPY FRAMER CODE
          </button>
        </div>
      </Html>
    </mesh>
  )
}
