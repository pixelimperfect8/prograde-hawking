import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

const AdvancedGradientMaterial = shaderMaterial(
    {
        uTime: 0,
        // Max 5 colors provided via uniform array logic below
        uColors: new Float32Array(30),
        uColorCount: 2,
        uType: 0, // 0 = Linear, 1 = Radial
        uAngle: 0,
        uCenter: new THREE.Vector2(0.5, 0.5),
        uRadius: 1.0,
        uBackgroundColor: new THREE.Color('#000000'),
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
    uniform int uColorCount;
    uniform int uType;
    uniform float uAngle;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform vec3 uBackgroundColor;
    uniform int uAnimation;
    uniform float uSpeed;
    uniform float uRoughness;
    
    varying vec2 vUv;

    // High frequency noise for frosted look
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    // Perlin-ish noise for smoother wave distortion
    // (Simplified)
    float noise(vec2 p) {
        return sin(p.x * 10.0 + p.y * 10.0);
    }

    // Smoothstep interpolation between n colors
    vec3 getColor(float t) {
        // t is 0.0 to 1.0
        float scaledT = t * float(uColorCount - 1);
        int index = int(scaledT);
        float frac = fract(scaledT);
        
        // Use smoothstep for buttery transitions
        frac = smoothstep(0.0, 1.0, frac);
        
        // Safe clamp
        if (index >= uColorCount - 1) return uColors[uColorCount - 1];
        if (index < 0) return uColors[0];
        
        vec3 c1 = vec3(0.0);
        vec3 c2 = vec3(0.0);

        // Standard loops for compatibility
        for(int i = 0; i < 10; i++) {
            if (i == index) c1 = uColors[i];
            if (i == index + 1) c2 = uColors[i];
        }

        return mix(c1, c2, frac);
    }

    void main() {
        vec2 uv = vUv;
        
        // --- Frosted Roughness (UV Perturbation) ---
        // Instead of adding grain to color, we distort the UV lookup slightly.
        if (uRoughness > 0.0) {
           float grainX = random(uv + uTime * 0.1);
           float grainY = random(uv + vec2(1.0) + uTime * 0.1);
           uv += vec2(grainX - 0.5, grainY - 0.5) * (uRoughness * 0.1); // Scale down effect
        }

        float t = 0.0;
        float alpha = 1.0;

        // --- Linear Logic ---
        if (uType == 0) { // Linear
            // Rotate UV
            vec2 centered = uv - 0.5;
            float s = sin(radians(uAngle));
            float c = cos(radians(uAngle));
            mat2 rot = mat2(c, -s, s, c);
            centered = centered * rot;
            vec2 rotatedUv = centered + 0.5;
            
            t = rotatedUv.y;
            
            // --- Animations (In-Place) ---
            if (uAnimation == 1) { // Flow = Subtle Wave
                // Distort t based on sine wave along orthogonal axis (x)
                float wave = sin(rotatedUv.x * 3.14 * 2.0 + uTime * uSpeed) * 0.1;
                t += wave;
            }
            if (uAnimation == 2) { // Pulse = Breathe (Scale gradient)
                float breathe = 1.0 + sin(uTime * uSpeed) * 0.1;
                // Scale t around 0.5
                t = (t - 0.5) * breathe + 0.5;
            }
            
            t = clamp(t, 0.0, 1.0);
        } 
        // --- Radial Logic ---
        else { // Radial
            float d = distance(uv, uCenter);
            
            // Normalize by radius
            // If d = 0, t = 0. If d = Radius, t = 1.
            if (uRadius > 0.001) {
                 t = d / uRadius;
            } else {
                 t = 0.0;
            }
            
            // --- Animations (In-Place) ---
            if (uAnimation == 1) { // Flow = Ripple/Wave ring
                // Modulate radius slightly
                 float wave = sin(d * 20.0 - uTime * uSpeed * 2.0) * 0.05;
                 t += wave;
            }
            if (uAnimation == 2) { // Pulse = Breathe Size
                float breathe = 1.0 + sin(uTime * uSpeed) * 0.15;
                t /= breathe; // Adjust effective distance
            }

            // Radial Masking for Background Color
            // Smooth fade out at edge of radius
            // t is usually 0 to >1
            
            if (t > 1.0) {
               // Mix with background or just hard clamp? 
               // User asked for background color.
               // Let's implement background color blending.
            }
        }

        vec3 color = getColor(clamp(t, 0.0, 1.0));
        
        // Background Color Blending (Radial only mostly)
        if (uType == 1) {
             // Smooth transition to background at t=1.0
             float edge = 1.0 - smoothstep(0.95, 1.05, t); // Soft edge
             color = mix(uBackgroundColor, color, edge);
        }

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

    // Prepare colors uniform array (max 10)
    const colorArray = useMemo(() => {
        const arr = new Float32Array(30) // 10 * 3
        const colors = advancedGradient.colors || ['#ffffff', '#000000']
        colors.forEach((c, i) => {
            if (i < 10) {
                const col = new THREE.Color(c)
                arr[i * 3] = col.r
                arr[i * 3 + 1] = col.g
                arr[i * 3 + 2] = col.b
            }
        })
        const last = colors[colors.length - 1]
        const lastCol = new THREE.Color(last)
        for (let i = colors.length; i < 10; i++) {
            arr[i * 3] = lastCol.r
            arr[i * 3 + 1] = lastCol.g
            arr[i * 3 + 2] = lastCol.b
        }
        return arr
    }, [advancedGradient.colors])

    return (
        <mesh scale={[viewport.width * 2, viewport.height * 2, 1]}>
            <planeGeometry args={[1, 1, 64, 64]} />
            {/* Increased segments for smoother UV perturbation if we were doing vertex, 
             but we are doing fragment. Keep pure quad is fine, but more vertices help if we ever add vertex displacement.
             Actually fragment shader UV perturbation works on single quad.
          */}
            {/* @ts-ignore */}
            <advancedGradientMaterial
                ref={materialRef}
                uColors={colorArray}
                uColorCount={Math.min(advancedGradient.colors.length, 10)}
                uType={advancedGradient.type === 'Linear' ? 0 : 1}
                uAngle={advancedGradient.angle}
                uCenter={new THREE.Vector2(advancedGradient.centerX, advancedGradient.centerY)}
                uRadius={advancedGradient.radius}
                uBackgroundColor={new THREE.Color(advancedGradient.backgroundColor)}
                uAnimation={advancedGradient.animation === 'Static' ? 0 : advancedGradient.animation === 'Flow' ? 1 : 2}
                uSpeed={advancedGradient.speed}
                uRoughness={advancedGradient.roughness}
            />
        </mesh>
    )
}
