import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

const AdvancedGradientMaterial = shaderMaterial(
    {
        uTime: 0,
        uColors: new Float32Array(40), // Max 10 colors * 4 (RGBA)
        uStops: new Float32Array(10),
        uCount: 2,
        uAngle: 0,
        uAnimation: 0,
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
    uniform vec4 uColors[10];  // changed to vec4
    uniform float uStops[10];
    uniform int uCount;
    uniform float uAngle;
    uniform int uAnimation;
    uniform float uSpeed;
    uniform float uRoughness;
    
    varying vec2 vUv;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // Return vec4
    vec4 getColor(float t) {
        t = clamp(t, 0.0, 1.0);

        if (t <= uStops[0]) return uColors[0];
        if (t >= uStops[uCount-1]) return uColors[uCount-1];

        for(int i = 0; i < 9; i++) {
            if (i >= uCount - 1) break;

            float p1 = uStops[i];
            float p2 = uStops[i+1];

            if (t >= p1 && t <= p2) {
                float denom = p2 - p1;
                if (denom < 0.0001) return uColors[i+1];

                float localT = (t - p1) / denom;
                localT = smoothstep(0.0, 1.0, localT);
                
                return mix(uColors[i], uColors[i+1], localT);
            }
        }
        return uColors[uCount-1];
    }

    void main() {
        vec2 uv = vUv;
        
        if (uRoughness > 0.0) {
           float grainX = random(uv + uTime * 0.1);
           float grainY = random(uv + vec2(1.0) + uTime * 0.1);
           uv += vec2(grainX - 0.5, grainY - 0.5) * (uRoughness * 0.1); 
        }

        // --- Linear Logic ---
        vec2 centered = uv - 0.5;
        float s = sin(radians(uAngle));
        float c = cos(radians(uAngle));
        mat2 rot = mat2(c, -s, s, c);
        centered = centered * rot;
        vec2 rotatedUv = centered + 0.5;
        
        float t = rotatedUv.y;
        
        if (uAnimation == 1) { // Flow
            float wave = sin(rotatedUv.x * 3.14 * 2.0 + uTime * uSpeed) * 0.15; 
            t += wave;
        }
        if (uAnimation == 2) { // Pulse
            float breathe = 1.0 + sin(uTime * uSpeed) * 0.1;
            t = (t - 0.5) * breathe + 0.5;
        }
        
        vec4 color = getColor(t);

        gl_FragColor = color;
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
        const uCols = new Float32Array(40) // 10 * 4 (RGBA)
        const uStps = new Float32Array(10)

        const stops = advancedGradient.stops || []
        // Sort stops by pos
        const sorted = [...stops].sort((a, b) => a.pos - b.pos)

        sorted.forEach((stop, i) => {
            if (i < 10) {
                const col = new THREE.Color(stop.color)
                uCols[i * 4] = col.r
                uCols[i * 4 + 1] = col.g
                uCols[i * 4 + 2] = col.b
                uCols[i * 4 + 3] = stop.opacity !== undefined ? stop.opacity : 1.0

                uStps[i] = stop.pos
            }
        })

        return { flattenedColors: uCols, flattenedStops: uStps }
    }, [advancedGradient.stops])

    return (
        <mesh scale={[viewport.width * 2, viewport.height * 2, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <advancedGradientMaterial
                ref={materialRef}
                transparent={true} // Enable transparency
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
