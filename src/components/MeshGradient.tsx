import { useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { Color } from 'three'
import { shaderMaterial, Html } from '@react-three/drei'
import { useControls, button } from 'leva'
import { useStore, PRESETS } from '../store'
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



export default function MeshGradient() {
  const materialRef = useRef<any>(null)

  // Connect to Global Store
  const { gradient, setGradient, applyPreset, randomizeColors } = useStore()

  // Sync Leva -> Store
  useControls('Gradient Settings', () => ({
    'Randomize Colors': button(() => randomizeColors()),
    preset: {
      value: 'Neon',
      options: ['Custom', ...Object.keys(PRESETS)],
      onChange: (value) => {
        if (value !== 'Custom') applyPreset(value)
      }
    },
    color1: { value: gradient.color1, onChange: (v) => setGradient({ color1: v }) },
    color2: { value: gradient.color2, onChange: (v) => setGradient({ color2: v }) },
    color3: { value: gradient.color3, onChange: (v) => setGradient({ color3: v }) },
    color4: { value: gradient.color4, onChange: (v) => setGradient({ color4: v }) },
    speed: { value: gradient.speed, min: 0, max: 2, onChange: (v) => setGradient({ speed: v }) },
    noiseDensity: { value: gradient.noiseDensity, min: 0.1, max: 5, onChange: (v) => setGradient({ noiseDensity: v }) },
    noiseStrength: { value: gradient.noiseStrength, min: 0, max: 1, onChange: (v) => setGradient({ noiseStrength: v }) },
    wireframe: { value: gradient.wireframe, onChange: (v) => setGradient({ wireframe: v }) },

    kaleidoscope: { value: gradient.kaleidoscope, onChange: (v) => setGradient({ kaleidoscope: v }) },
    kSegments: {
      value: gradient.kSegments,
      min: 2, max: 20, step: 1,
      render: (get) => get('Gradient Settings.kaleidoscope'),
      onChange: (v) => setGradient({ kSegments: v })
    }
  }), [gradient]) // Dependency array ensures Leva updates if store changes from other sources (like Presets)

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
        uColor1={new Color(gradient.color1)}
        uColor2={new Color(gradient.color2)}
        uColor3={new Color(gradient.color3)}
        uColor4={new Color(gradient.color4)}
        uSpeed={gradient.speed}
        uNoiseDensity={gradient.noiseDensity}
        uNoiseStrength={gradient.noiseStrength}
        uKaleidoEnabled={gradient.kaleidoscope ? 1.0 : 0.0}
        uKaleidoSegments={gradient.kSegments}
        wireframe={gradient.wireframe}
      />
    </mesh>
  )
}
