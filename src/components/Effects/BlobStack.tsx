import { useRef } from 'react'
import { useStore } from '../../store'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

import { Color } from 'three'
import * as THREE from 'three'

const BlobStackMaterial = shaderMaterial(
    {
        uColor1: new Color('#ffeda3'),
        uColor2: new Color('#ffc3a0'),
        uColor3: new Color('#ffafbd'),
        uPos1: new THREE.Vector2(0.5, 0.8),
        uPos2: new THREE.Vector2(0.5, 0.5),
        uPos3: new THREE.Vector2(0.5, 0.2),
        uRadius1: 1.0,
        uRadius2: 1.0,
        uRadius3: 1.0,
        uFalloff1: 0.5,
        uFalloff2: 0.5,
        uFalloff3: 0.5,
        uAspect: 1.0,
        uNoiseInfo: 0.05,
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
    uniform vec3 uColor3;
    uniform vec2 uPos1;
    uniform vec2 uPos2;
    uniform vec2 uPos3;
    uniform float uRadius1;
    uniform float uRadius2;
    uniform float uRadius3;
    uniform float uFalloff1;
    uniform float uFalloff2;
    uniform float uFalloff3;
    uniform float uAspect;
    uniform float uNoiseInfo;
    varying vec2 vUv;

    // Random
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // Aspect Correct
      vec2 uv = vUv;
      vec2 aspectUV = uv;
      aspectUV.x *= uAspect;
      
      vec2 p1 = uPos1; p1.x *= uAspect;
      vec2 p2 = uPos2; p2.x *= uAspect;
      vec2 p3 = uPos3; p3.x *= uAspect;

      // Calculate Influence
      float d1 = distance(aspectUV, p1);
      float d2 = distance(aspectUV, p2);
      float d3 = distance(aspectUV, p3);

      // Smooth falloff
      float w1 = smoothstep(uRadius1, uRadius1 * (1.0 - uFalloff1), d1);
      float w2 = smoothstep(uRadius2, uRadius2 * (1.0 - uFalloff2), d2);
      float w3 = smoothstep(uRadius3, uRadius3 * (1.0 - uFalloff3), d3);

      float total = w1 + w2 + w3 + 0.0001;
      
      // Painter's Algo Approach:
      // Start with Col3 (Bottom)
      vec3 paint = uColor3;
      
      // Mix Col2 over it
      float a2 = smoothstep(uRadius2, uRadius2 * (1.0 - uFalloff2), d2);
      paint = mix(paint, uColor2, a2);
      
      // Mix Col1 over it
      float a1 = smoothstep(uRadius1, uRadius1 * (1.0 - uFalloff1), d1);
      paint = mix(paint, uColor1, a1);
      
      // Add noise
      float n = random(uv) * uNoiseInfo;
      paint += n;

      gl_FragColor = vec4(paint, 1.0);
    }
  `
)

extend({ BlobStackMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            blobStackMaterial: any
        }
    }
}



export default function BlobStack() {
    const materialRef = useRef<any>(null)

    const { viewport } = useThree()
    const width = viewport.width
    const height = viewport.height
    const aspect = width / height

    // Leva Removed - Using hardcoded defaults
    const { blob } = useStore()

    // Static config for positions, dynamic for colors
    const config = {
        Direction: blob.direction,
        // Layer 1
        Color1: blob.color1,
        Radius1: 0.44,
        Falloff1: 0.5,
        Offset1: blob.offset1,
        // Layer 2
        Color2: blob.color2,
        Radius2: 0.26,
        Falloff2: 0.66,
        Offset2: blob.offset2,
        // Layer 3
        Color3: blob.color3,
        Radius3: 2.18,

        Noise: blob.noise,
    }

    // Derived positions based on direction + offsets
    const getPositions = () => {
        let p1 = { x: 0.5, y: 0.5 }
        let p2 = { x: 0.5, y: 0.5 }
        let p3 = { x: 0.5, y: 0.5 }

        switch (config.Direction) {
            case 'Top-to-Bottom':
                p1 = { x: 0.5, y: 0.9 } // Top
                p2 = { x: 0.5, y: 0.5 } // Center
                p3 = { x: 0.5, y: 0.1 } // Bottom
                break;
            case 'Bottom-to-Top':
                p1 = { x: 0.5, y: 0.1 }
                p2 = { x: 0.5, y: 0.5 }
                p3 = { x: 0.5, y: 0.9 }
                break;
            case 'Left-to-Right':
                p1 = { x: 0.1, y: 0.5 }
                p2 = { x: 0.5, y: 0.5 }
                p3 = { x: 0.9, y: 0.5 }
                break;
            case 'Right-to-Left':
                p1 = { x: 0.9, y: 0.5 }
                p2 = { x: 0.5, y: 0.5 }
                p3 = { x: 0.1, y: 0.5 }
                break;
        }

        // Apply manual offsets
        p1.x += config.Offset1.x; p1.y += config.Offset1.y;
        p2.x += config.Offset2.x; p2.y += config.Offset2.y;

        return { p1, p2, p3 }
    }

    const { p1, p2, p3 } = getPositions()

    useFrame(() => {
        if (materialRef.current) {
            materialRef.current.uAspect = aspect
        }
    })

    return (
        <mesh scale={[width * 1.5, height * 1.5, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <blobStackMaterial
                ref={materialRef}
                uColor1={new Color(config.Color1)}
                uColor2={new Color(config.Color2)}
                uColor3={new Color(config.Color3)}
                uPos1={new THREE.Vector2(p1.x, p1.y)}
                uPos2={new THREE.Vector2(p2.x, p2.y)}
                uPos3={new THREE.Vector2(p3.x, p3.y)}
                uRadius1={config.Radius1}
                uRadius2={config.Radius2}
                uRadius3={config.Radius3}
                uFalloff1={config.Falloff1}
                uFalloff2={config.Falloff2}
                uFalloff3={0.0}
                uNoiseInfo={config.Noise}
            />

        </mesh>
    )
}
