import { useRef, useEffect } from 'react'
import { useStore } from '../../store'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

import { Color } from 'three'
import * as THREE from 'three'

const GlowMaterial = shaderMaterial(
    {
        uColor1: new Color('#00d0ff'),
        uColor2: new Color('#ff0055'),
        uPos1: new THREE.Vector2(0.5, 0.5),
        uPos2: new THREE.Vector2(0.5, 0.5),
        uRadius1: 0.5,
        uRadius2: 0.5,
        uIntensity: 1.0,
        uTime: 0,
        uPulseSpeed: 0.5,
        uAspect: 1.0,
        uKaleidoEnabled: 0.0,
        uKaleidoSegments: 6.0,
    },
    // Vertex
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment
    `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec2 uPos1;
    uniform vec2 uPos2;
    uniform float uRadius1;
    uniform float uRadius2;
    uniform float uIntensity;
    uniform float uTime;
    uniform float uPulseSpeed;
    uniform float uAspect;
    uniform float uKaleidoEnabled;
    uniform float uKaleidoSegments;
    varying vec2 vUv;

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

      vec2 aspectUV = uv;
      aspectUV.x *= uAspect;
      
      vec2 pos1 = uPos1;
      pos1.x *= uAspect;
      
      vec2 pos2 = uPos2;
      pos2.x *= uAspect;

      float pulse = 0.95 + 0.05 * sin(uTime * uPulseSpeed);

      float d1 = distance(aspectUV, pos1);
      float glow1 = exp(-pow(d1 * (4.0 / (uRadius1 * pulse)), 2.0));
      
      float pulse2 = 0.95 + 0.05 * sin(uTime * uPulseSpeed + 1.5); 
      float d2 = distance(aspectUV, pos2);
      float glow2 = exp(-pow(d2 * (4.0 / (uRadius2 * pulse2)), 2.0));

      vec3 finalColor = (uColor1 * glow1 + uColor2 * glow2) * uIntensity;
      
      float alpha = max(glow1, glow2);
      alpha = smoothstep(0.01, 1.0, alpha); 

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
)

extend({ GlowMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            glowMaterial: any
        }
    }
}



export default function GlowOverlay() {
    const materialRef = useRef<any>(null)

    const { viewport } = useThree()
    const visibleWidth = viewport.width * 2.0
    const visibleHeight = viewport.height * 2.0
    const aspect = visibleWidth / visibleHeight

    // Leva Removed - Using hardcoded defaults
    const { glow } = useStore()

    const config = {
        enabled: true,
        preset: 'Diagonal',
        // Orb 1
        color1: glow.color1,
        pos1: glow.pos1,
        radius1: glow.radius1,
        // Orb 2
        color2: glow.color2,
        pos2: glow.pos2,
        radius2: glow.radius2,

        intensity: glow.intensity,
        pulseSpeed: glow.pulseSpeed,
        kaleidoscope: false,
        kSegments: 6
    }

    // Preset logic removed as it was tied to Leva state
    useEffect(() => {
        // Placeholder for future store integration
    }, [])

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uTime = clock.getElapsedTime()
        }
    })

    if (!config.enabled) return null

    return (
        <mesh position={[0, 0, 0.1]} renderOrder={1}>
            <planeGeometry args={[visibleWidth, visibleHeight]} />
            {/* @ts-ignore */}
            <glowMaterial
                ref={materialRef}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                uColor1={new Color(config.color1)}
                uColor2={new Color(config.color2)}
                uPos1={new THREE.Vector2(config.pos1.x, config.pos1.y)}
                uPos2={new THREE.Vector2(config.pos2.x, config.pos2.y)}
                uRadius1={config.radius1}
                uRadius2={config.radius2}
                uIntensity={config.intensity}
                uPulseSpeed={config.pulseSpeed}
                uAspect={aspect}
                uKaleidoEnabled={0.0}
                uKaleidoSegments={6.0}
            />
        </mesh>
    )
}
