import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

const AdvancedGradientMaterial = shaderMaterial(
    {
        uTime: 0,
        uColors: new Float32Array(40),
        uStops: new Float32Array(10),
        uCount: 2,
        uAngle: 0,
        uAnimation: 0,
        uSpeed: 0.2,
        uRoughness: 0,
        uResolution: new THREE.Vector2(1, 1)
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
    uniform vec4 uColors[10];
    uniform float uStops[10];
    uniform int uCount;
    uniform float uAngle;
    uniform int uAnimation;
    uniform float uSpeed;
    uniform float uRoughness;
    uniform vec2 uResolution;
    
    varying vec2 vUv;

    // Value Noise 2D (Smoother than white noise)
    float hash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * .1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
    }
    
    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        
        // Cubic Hermite Interpolation
        vec2 u = f*f*(3.0-2.0*f);
        
        return mix(mix(hash(i + vec2(0.0,0.0)), 
                       hash(i + vec2(1.0,0.0)), u.x),
                   mix(hash(i + vec2(0.0,1.0)), 
                       hash(i + vec2(1.0,1.0)), u.x), u.y);
    }

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
    
    // Calculate Gradient T for a given UV (abstracted for multi-sampling)
    float getT(vec2 uv) {
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
        return t;
    }

    void main() {
        vec2 uv = vUv;
        
        // --- High Quality Blur/Frost ---
        vec4 accColor = vec4(0.0);
        float totalWeight = 0.0;
        
        // if Roughness is 0, just sample once
        if (uRoughness <= 0.01) {
            gl_FragColor = getColor(getT(uv));
            return;
        }

        // Noise-based jitter for "Frost" look
        // We use the noise function to generate offsets.
        // Scaling noise frequency higher makes it finer grain, lower makes it wavy.
        // "Frosted" usually implies fine grain but smooth edges.
        float noiseScale = 500.0; // Moderate high freq
        
        // 5 Samples with jitter
        // Center
        accColor += getColor(getT(uv));
        totalWeight += 1.0;
        
        // Jitter amount based on roughness
        float spread = uRoughness * 0.05;

        // Sample 1
        float n1 = noise(uv * noiseScale + vec2(0.0, uTime * 0.1));
        float t1 = getT(uv + vec2(n1 - 0.5) * spread);
        accColor += getColor(t1);
        totalWeight += 1.0;
        
        // Sample 2 (Offset phase)
        float n2 = noise(uv * noiseScale + vec2(10.0, uTime * 0.15));
        float t2 = getT(uv + vec2(n2 - 0.5) * spread);
        accColor += getColor(t2);
        totalWeight += 1.0;
         
         // Sample 3
        float n3 = noise(uv * noiseScale + vec2(20.0, uTime * 0.05));
        float t3 = getT(uv + vec2(n3 - 0.5) * spread);
        accColor += getColor(t3);
        totalWeight += 1.0;
        
        // Average
        vec4 finalColor = accColor / totalWeight;
        
        // Optional: Add very subtle grain texturing on top for "tactile" feel?
        // float g = hash(uv * 1000.0 + uTime) - 0.5;
        // finalColor.rgb += g * uRoughness * 0.05;

        gl_FragColor = finalColor;
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
    const { viewport, size } = useThree()

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uTime = clock.getElapsedTime()
            materialRef.current.uResolution = new THREE.Vector2(size.width, size.height)
        }
    })

    const { flattenedColors, flattenedStops } = useMemo(() => {
        const uCols = new Float32Array(40)
        const uStps = new Float32Array(10)
        const stops = advancedGradient.stops || []
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
                transparent={true}
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
