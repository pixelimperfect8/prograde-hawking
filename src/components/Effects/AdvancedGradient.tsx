import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

const AdvancedGradientMaterial = shaderMaterial(
    {
        uTime: 0,
        uColors: new Float32Array(30), // Max 10 colors
        uStops: new Float32Array(10),  // Max 10 positions
        uCount: 2,
        uAngle: 0,
        uAnimation: 0, // 0=Static, 1=Flow (Wave), 2=Pulse (Breathe)
        uSpeed: 0.2,
        uRoughness: 0
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
    uniform vec3 uColors[10]; 
    uniform float uStops[10];
    uniform int uCount;
    uniform float uAngle;
    uniform int uAnimation;
    uniform float uSpeed;
    uniform float uRoughness;
    
    varying vec2 vUv;

    // High frequency noise for frosted look
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // Smoothstep interpolation between stops
    vec3 getColor(float t) {
        // Clamp t just in case
        t = clamp(t, 0.0, 1.0);

        // Find the interval
        // We assume stops are sorted in JS, but let's be safe and check sequential
        // If t < first stop, return first color
        if (t <= uStops[0]) return uColors[0];
        // If t > last stop, return last color
        if (t >= uStops[uCount-1]) return uColors[uCount-1];

        // Linear Search for interval
        for(int i = 0; i < 9; i++) {
            if (i >= uCount - 1) break;

            float p1 = uStops[i];
            float p2 = uStops[i+1];

            if (t >= p1 && t <= p2) {
                // Determine mix factor
                // avoid divide by zero if stops are stacked
                float denom = p2 - p1;
                if (denom < 0.0001) return uColors[i+1];

                float localT = (t - p1) / denom;
                
                // Smoothstep for buttery transition
                localT = smoothstep(0.0, 1.0, localT);
                
                return mix(uColors[i], uColors[i+1], localT);
            }
        }
        return uColors[uCount-1];
    }

    void main() {
        vec2 uv = vUv;
        
        // --- Frosted Roughness (UV Perturbation) ---
        if (uRoughness > 0.0) {
           float grainX = random(uv + uTime * 0.1);
           float grainY = random(uv + vec2(1.0) + uTime * 0.1);
           uv += vec2(grainX - 0.5, grainY - 0.5) * (uRoughness * 0.1); 
        }

        // --- Linear Logic ---
        // Rotate UV
        vec2 centered = uv - 0.5;
        float s = sin(radians(uAngle));
        float c = cos(radians(uAngle));
        mat2 rot = mat2(c, -s, s, c);
        centered = centered * rot;
        vec2 rotatedUv = centered + 0.5;
        
        float t = rotatedUv.y;
        
        // --- Animations (In-Place) ---
        if (uAnimation == 1) { // Flow = Subtle Wave
            // Distort t based on sine wave along orthogonal axis
            float wave = sin(rotatedUv.x * 3.14 * 2.0 + uTime * uSpeed) * 0.15; // slightly stronger wave
            t += wave;
        }
        if (uAnimation == 2) { // Pulse = Breathe
            float breathe = 1.0 + sin(uTime * uSpeed) * 0.1;
            t = (t - 0.5) * breathe + 0.5;
        }
        
        // Pass t directly to getColor, which handles the stops
        vec3 color = getColor(t);

        gl_FragColor = vec4(color, 1.0);
    }
  `
)

extend({ AdvancedGradientMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            advancedGradientMaterial: any
        }
    }
}

export default function AdvancedGradient() {
    const materialRef = useRef<any>(null)
    const { advancedGradient } = useStore()
    const { viewport } = useThree()

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uTime = clock.getElapsedTime()
        }
    })

    // Prepare uniform arrays
    const { flattenedColors, flattenedStops } = useMemo(() => {
        const uCols = new Float32Array(30) // 10 * 3
        const uStps = new Float32Array(10) // 10 floats

        const stops = advancedGradient.stops || []
        // Ensure up to 10
        // Ensure up to 10
        // const count = Math.min(stops.length, 10)

        // Sort stops by pos just in case
        const sorted = [...stops].sort((a, b) => a.pos - b.pos)

        sorted.forEach((stop, i) => {
            if (i < 10) {
                const col = new THREE.Color(stop.color)
                uCols[i * 3] = col.r
                uCols[i * 3 + 1] = col.g
                uCols[i * 3 + 2] = col.b

                uStps[i] = stop.pos
            }
        })

        // Fill rest logic is less critical now due to loop guard, but good practice

        return { flattenedColors: uCols, flattenedStops: uStps }
    }, [advancedGradient.stops])

    return (
        <mesh scale={[viewport.width * 2, viewport.height * 2, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <advancedGradientMaterial
                ref={materialRef}
                uColors={flattenedColors}
                uStops={flattenedStops}
                uCount={Math.min(advancedGradient.stops.length, 10)}
                uAngle={advancedGradient.angle}
                uAnimation={advancedGradient.animation === 'Static' ? 0 : advancedGradient.animation === 'Flow' ? 1 : 2}
                uSpeed={advancedGradient.speed}
                uRoughness={advancedGradient.roughness}
            />
        </mesh>
    )
}
