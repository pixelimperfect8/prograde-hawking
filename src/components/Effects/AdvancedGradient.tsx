import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

const AdvancedGradientMaterial = shaderMaterial(
    {
        uTime: 0,
        uColors: new Float32Array(5 * 3), // Max 5 colors supported initially? Or use Texture for N colors
        uColorCount: 2,
        uType: 0, // 0 = Linear, 1 = Radial
        uAngle: 0,
        uCenter: new THREE.Vector2(0.5, 0.5),
        uAnimation: 0, // 0=Static, 1=Flow, 2=Pulse
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
    uniform vec3 uColors[10]; // Support up to 10 colors
    uniform int uColorCount;
    uniform int uType;
    uniform float uAngle;
    uniform vec2 uCenter;
    uniform int uAnimation;
    uniform float uSpeed;
    uniform float uRoughness;
    
    varying vec2 vUv;

    // Pseudo-random noise for roughness
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // Linear interpolation between n colors
    vec3 getColor(float t) {
        // t is 0.0 to 1.0
        float scaledT = t * float(uColorCount - 1);
        int index = int(scaledT);
        float frac = fract(scaledT);
        
        // Safe clamp
        if (index >= uColorCount - 1) return uColors[uColorCount - 1];
        if (index < 0) return uColors[0];
        
        // Since GLSL ES 3.0 (WebGL 2) allows dynamic array access (usually), 
        // but for compatibility we might need a cascading if/else if WebGL 1
        // Assuming WebGL 2 environment mostly in Three.js recent versions
        
        // Fallback for uniform array access in older GLSL
        vec3 c1 = vec3(0.0);
        vec3 c2 = vec3(0.0);

        for(int i = 0; i < 10; i++) {
            if (i == index) c1 = uColors[i];
            if (i == index + 1) c2 = uColors[i];
        }

        return mix(c1, c2, frac);
    }

    void main() {
        vec2 uv = vUv;
        float t = 0.0;

        // --- Linear Logic ---
        if (uType == 0) { // Linear
            // Rotate UV based on angle
            // Center rotation around 0.5
            vec2 centered = uv - 0.5;
            float s = sin(radians(uAngle));
            float c = cos(radians(uAngle));
            mat2 rot = mat2(c, -s, s, c);
            centered = centered * rot;
            vec2 rotatedUv = centered + 0.5;
            
            // t = y-axis usually for linear gradient, or x-axis
            // Let's use rotated y or x. Let's say it flows along Y effectively after rotation?
            // Actually standard linear gradient usually defines a line.
            // Simplified: mapped to rotated Y.
            t = rotatedUv.y;
            
            // Flow Animation: shift t
            if (uAnimation == 1) { // Flow
               t += uTime * uSpeed;
               t = fract(t); // Repeat
               
               // Mirror/PingPong for smoother flow?
               // Or just linear repeat
             }
        } 
        // --- Radial Logic ---
        else { // Radial
            float d = distance(uv, uCenter);
            
            // Pulse Animation: modify distance
            if (uAnimation == 2) { // Pulse
                float pulse = 1.0 + sin(uTime * uSpeed * 2.0) * 0.1;
                d = d * pulse;
            }
            
            // Flow Animation Radial: expanding rings
             if (uAnimation == 1) { // Flow
                 d -= uTime * uSpeed;
                 d = fract(d);
             }

            t = d;
            
            // Clamp radial to edges usually? Or repeat?
            // Usually radial gradient is 0 at center to 1 at edge.
            // Let's scale it slightly so 0.5 distance (edge of unit circle) covers more?
            // Standard CSS radial is often center to farthest corner.
            t = clamp(t, 0.0, 1.0);
        }

        // --- Pulse Animation (Global color shift alternative) ---
        // if (uAnimation == 2 && uType == 0) {
           // Maybe pulse shifts the midpoint?
        // }
        
        
        vec3 color = getColor(clamp(t, 0.0, 1.0));

        // --- Roughness (Grain) ---
        if (uRoughness > 0.0) {
           float grain = random(uv + uTime);
           // Overlay: grain * roughness
           color += (grain - 0.5) * uRoughness;
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
        // Fill remaining with last color to be safe
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
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <advancedGradientMaterial
                ref={materialRef}
                uColors={colorArray}
                uColorCount={Math.min(advancedGradient.colors.length, 10)}
                uType={advancedGradient.type === 'Linear' ? 0 : 1}
                uAngle={advancedGradient.angle}
                uCenter={new THREE.Vector2(advancedGradient.centerX, advancedGradient.centerY)}
                uAnimation={advancedGradient.animation === 'Static' ? 0 : advancedGradient.animation === 'Flow' ? 1 : 2}
                uSpeed={advancedGradient.speed}
                uRoughness={advancedGradient.roughness}
            />
        </mesh>
    )
}
