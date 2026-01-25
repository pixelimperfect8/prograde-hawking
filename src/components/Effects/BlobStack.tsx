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
        uTime: 0.0,
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
    uniform float uTime;
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

    const { blob } = useStore()


    // Derived positions based on direction + offsets
    const getPositions = (animOffset: { x1: number, y1: number, x2: number, y2: number, r1: number, r2: number }) => {
        let p1 = { x: 0.5, y: 0.5 }
        let p2 = { x: 0.5, y: 0.5 }
        let p3 = { x: 0.5, y: 0.5 }

        switch (blob.direction) {
            case 'Top-to-Bottom':
                p1 = { x: 0.5, y: 0.9 }
                p2 = { x: 0.5, y: 0.5 }
                p3 = { x: 0.5, y: 0.1 }
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

        // Apply manual offsets + animation offsets
        p1.x += blob.blob1.offsetX + animOffset.x1
        p1.y += blob.blob1.offsetY + animOffset.y1
        p2.x += blob.blob2.offsetX + animOffset.x2
        p2.y += blob.blob2.offsetY + animOffset.y2

        return { p1, p2, p3 }
    }

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uAspect = aspect
            materialRef.current.uTime = clock.getElapsedTime()

            // Animation logic
            if (blob.animation.enabled) {
                const t = clock.getElapsedTime() * blob.animation.speed
                let animOffset = { x1: 0, y1: 0, x2: 0, y2: 0, r1: 0, r2: 0 }

                switch (blob.animation.type) {
                    case 'Pulse':
                        // Oscillate radius
                        animOffset.r1 = Math.sin(t) * 0.1
                        animOffset.r2 = Math.sin(t + 1) * 0.08
                        break
                    case 'Float':
                        // Oscillate position
                        animOffset.x1 = Math.sin(t * 0.7) * 0.05
                        animOffset.y1 = Math.cos(t * 0.5) * 0.05
                        animOffset.x2 = Math.cos(t * 0.6) * 0.04
                        animOffset.y2 = Math.sin(t * 0.8) * 0.04
                        break
                    case 'Breathe':
                        // Both radius and position
                        animOffset.r1 = Math.sin(t) * 0.08
                        animOffset.r2 = Math.sin(t + 0.5) * 0.06
                        animOffset.x1 = Math.sin(t * 0.5) * 0.03
                        animOffset.y1 = Math.cos(t * 0.3) * 0.03
                        animOffset.x2 = Math.cos(t * 0.4) * 0.025
                        animOffset.y2 = Math.sin(t * 0.6) * 0.025
                        break
                }

                const { p1, p2, p3 } = getPositions(animOffset)
                materialRef.current.uPos1 = new THREE.Vector2(p1.x, p1.y)
                materialRef.current.uPos2 = new THREE.Vector2(p2.x, p2.y)
                materialRef.current.uPos3 = new THREE.Vector2(p3.x, p3.y)
                materialRef.current.uRadius1 = blob.blob1.size + animOffset.r1
                materialRef.current.uRadius2 = blob.blob2.size + animOffset.r2
            } else {
                const { p1, p2, p3 } = getPositions({ x1: 0, y1: 0, x2: 0, y2: 0, r1: 0, r2: 0 })
                materialRef.current.uPos1 = new THREE.Vector2(p1.x, p1.y)
                materialRef.current.uPos2 = new THREE.Vector2(p2.x, p2.y)
                materialRef.current.uPos3 = new THREE.Vector2(p3.x, p3.y)
                materialRef.current.uRadius1 = blob.blob1.size
                materialRef.current.uRadius2 = blob.blob2.size
            }

            // Static values
            materialRef.current.uColor1 = new Color(blob.blob1.color)
            materialRef.current.uColor2 = new Color(blob.blob2.color)
            materialRef.current.uColor3 = new Color(blob.background.color)
            materialRef.current.uNoiseInfo = blob.noise
        }
    })

    return (
        <mesh scale={[width * 1.5, height * 1.5, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <blobStackMaterial
                ref={materialRef}
                uRadius3={2.18}
                uFalloff1={0.5}
                uFalloff2={0.66}
                uFalloff3={0.0}
            />
        </mesh>
    )
}
