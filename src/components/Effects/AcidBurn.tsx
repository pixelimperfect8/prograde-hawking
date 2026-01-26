import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

// Acid Burn shader - DOT MATRIX / ULTIMATE FLOW
// - Extremely dense grid (Zoomed out)
// - Liquid smooth motion (Low freq noise + Sine waves)
const AcidBurnShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uGlowColor: new THREE.Color('#00d4ff'),
        uBaseColor: new THREE.Color('#0a1628'),
        uDotColor: new THREE.Color('#1f2937'),
        uSpeed: 0.1,        // Very slow, majestic
        uGridScale: 250.0,  // WAY ZOOMED OUT (Tiny dots)
        uDotSize: 0.5,
        uWarp: 0.5,
        uAspectRatio: 1.0,
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
        precision highp float;
        
        uniform float uTime;
        uniform vec3 uGlowColor;
        uniform vec3 uBaseColor;
        uniform vec3 uDotColor;
        uniform float uSpeed;
        uniform float uGridScale;
        uniform float uDotSize;
        uniform float uWarp;
        uniform float uAspectRatio;
        
        varying vec2 vUv;
        
        // Simplex noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                    -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v - i + dot(i, C.xx);
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

        void main() {
            float time = uTime * uSpeed;
            
            // Grid Setup
            vec2 uv = vUv;
            uv.x *= uAspectRatio;
            
            vec2 gridUV = fract(uv * uGridScale);
            vec2 cellID = floor(uv * uGridScale);
            vec2 cellCenter = (cellID + 0.5) / uGridScale;
            
            vec2 center = vec2(0.5 * uAspectRatio, 0.5);
            vec2 p = cellCenter - center;
            
            // --- ULTIMATE FLOW EXPANSION ---
            
            // 1. Very Low Frequency Warp
            // Use Sine waves instead of noise for base shape to guarantee smoothness
            float angle = atan(p.y, p.x);
            float dist = length(p);
            
            // Warping field
            // Combine a few sine waves for "Liquid" feel
            float wave1 = sin(angle * 3.0 + time * 0.5);
            float wave2 = cos(angle * 2.0 - time * 0.3);
            float wave3 = sin(angle * 5.0 + time * 0.7 + dist * 2.0); // twist
            
            // Apply organic noise ON TOP of sine waves, but very subtle and low freq
            float noiseVal = snoise(p * 1.5 + vec2(time * 0.2));
            
            // Combine
            float warp = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2) * uWarp * 0.2;
            warp += noiseVal * uWarp * 0.1;
            
            // Distorted distance
            float dField = dist + warp;
            
            // Expanding Rings
            // We want them to spawn continuously
            float loop = fract(time); 
            float r1 = loop * 1.8; // Ring 1
            float r2 = fract(loop + 0.5) * 1.8; // Ring 2 (Staggered)
            
            // Soft Rings
            float width = 0.25; // Very wide, soft rings
            float ring1 = smoothstep(width, 0.0, abs(dField - r1));
            float ring2 = smoothstep(width, 0.0, abs(dField - r2));
            
            // Fade out as they get large
            ring1 *= smoothstep(1.5, 0.5, r1);
            ring2 *= smoothstep(1.5, 0.5, r2);
            
            float interaction = max(ring1, ring2);
            
            // --- DOT RENDERING ---
            // Base dots calculated from interaction
            float baseSize = 0.1 * uDotSize; 
            float boostSize = 0.8 * uDotSize; 
            
            float size = mix(baseSize, boostSize, interaction);
            
            // Circle SDF
            float dotDist = length(gridUV - 0.5);
            float dotMask = 1.0 - smoothstep(size - 0.1, size + 0.1, dotDist);
            
            // Color Logic
            vec3 col = mix(uDotColor, uGlowColor, interaction * 0.8);
            col += uGlowColor * interaction * 0.4; // bloom
            
            // BG
            vec3 pixel = mix(uBaseColor, col, dotMask);
            
            // Add subtle glow field
            pixel += uGlowColor * interaction * 0.15;
            
            gl_FragColor = vec4(pixel, 1.0);
        }
    `
)

extend({ AcidBurnShaderMaterial })

export default function AcidBurn() {
    const meshRef = useRef<THREE.Mesh>(null)
    const materialRef = useRef<any>(null)
    const { acidBurn } = useStore()
    const { viewport } = useThree()
    const aspect = viewport.width / viewport.height

    const colors = useMemo(() => ({
        glowColor: new THREE.Color(acidBurn.color1),
        baseColor: new THREE.Color(acidBurn.background),
        dotColor: new THREE.Color('#222'),
    }), [acidBurn.color1, acidBurn.background])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime
            // even slower for flow
            materialRef.current.uSpeed = acidBurn.speed * 0.5

            materialRef.current.uGlowColor = colors.glowColor
            materialRef.current.uBaseColor = colors.baseColor
            materialRef.current.uDotColor = colors.dotColor

            // Massively increased scale for "Zoomed Out" look
            materialRef.current.uGridScale = 250.0

            materialRef.current.uDotSize = Math.max(0.5, acidBurn.threshold)
            materialRef.current.uWarp = acidBurn.warp
            materialRef.current.uAspectRatio = aspect
        }
    })

    return (
        <mesh ref={meshRef} scale={[10, 10, 1]}>
            <planeGeometry args={[1, 1, 1, 1]} />
            {/* @ts-ignore - Custom shader material */}
            <acidBurnShaderMaterial ref={materialRef} />
        </mesh>
    )
}
