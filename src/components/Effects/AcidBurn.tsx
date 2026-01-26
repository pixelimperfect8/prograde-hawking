import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

// Acid Burn shader - MULTIPLE DANCING RINGS
// - 3 Staggered rings
// - Dynamic "dancing" warp
// - Proportional growth (corrected scaling)
const AcidBurnShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uGlowColor: new THREE.Color('#00d4ff'),
        uBaseColor: new THREE.Color('#0a1628'),
        uDotColor: new THREE.Color('#1f2937'),
        uSpeed: 0.1,
        uGridScale: 250.0,
        uDotSize: 0.5,
        uWarp: 0.3,
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

        // Helper for one ring
        float drawRing(vec2 p, float progress, float warpScale, float time) {
            float dist0 = length(p);
            float angle = atan(p.y, p.x);
            
            // "Dancing" Warp
            // Rotate the noise phase over time (angle + time)
            // Scale warp frequency with radius to keep shape complexity consistent
            float freq = 2.0 + progress * 1.5; 
            
            float w1 = sin(angle * freq + time * 2.0);
            float w2 = cos(angle * (freq * 1.5) - time * 1.5);
            float noise = snoise(p * (1.0 + progress) + vec2(time * 0.5));
            
            float warp = (w1 * 0.3 + w2 * 0.2 + noise * 0.5) * warpScale * 0.2;
            
            float dField = dist0 + warp;
            
            // Radius expands from 0 to 1.6
            float radius = progress * 1.6;
            
            // Width
            float width = 0.06;
            
            float ring = 1.0 - smoothstep(0.0, width, abs(dField - radius));
            
            // Mask center to prevent spawn artifacts
            ring *= smoothstep(0.05, 0.15, radius);
            
            // Fade out edge
            ring *= 1.0 - smoothstep(1.3, 1.6, radius);
            
            return ring;
        }

        void main() {
            float time = uTime * uSpeed;
            
            // Grid Setup
            vec2 uv = vUv;
            uv.x *= uAspectRatio;
            
            vec2 gridUV = fract(uv * uGridScale);
            vec2 cellID = floor(uv * uGridScale);
            vec2 cellCenter = (cellID + 0.5) / uGridScale;
            
            // Center in isotropic coords
            vec2 center = vec2(0.5 * uAspectRatio, 0.5);
            vec2 p = cellCenter - center;
            
            // --- MULTIPLE RINGS ---
            float totalInteraction = 0.0;
            
            // Ring 1
            float t1 = fract(time);
            totalInteraction = max(totalInteraction, drawRing(p, t1, uWarp, time));
            
            // Ring 2 (Offset 0.33)
            float t2 = fract(time + 0.33);
            totalInteraction = max(totalInteraction, drawRing(p, t2, uWarp, time + 10.0));
            
            // Ring 3 (Offset 0.66)
            float t3 = fract(time + 0.66);
            totalInteraction = max(totalInteraction, drawRing(p, t3, uWarp, time + 20.0));
            
            
            // --- EDGE GLOW ---
            vec2 uvCentered = vUv - 0.5;
            uvCentered.x *= uAspectRatio;
            float edgeDist = length(uvCentered);
            float edgeGlow = smoothstep(0.7, 1.4, edgeDist);
            
            // Merge
            float field = max(totalInteraction, edgeGlow * 0.3);
            
            // --- DOT RENDERING ---
            float baseSize = 0.1 * uDotSize; 
            float boostSize = 0.85 * uDotSize; 
            
            float size = mix(baseSize, boostSize, field);
            
            // Circle SDF
            float dotDist = length(gridUV - 0.5);
            float dotMask = 1.0 - smoothstep(size - 0.1, size + 0.1, dotDist);
            
            // Color Logic
            vec3 col = mix(uDotColor, uGlowColor, field);
            col += uGlowColor * field * 0.4; // Bloom
            
            vec3 pixel = mix(uBaseColor, col, dotMask);
            
            // Subtle Glow Field
            pixel += uGlowColor * field * 0.1;
            
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
            materialRef.current.uSpeed = acidBurn.speed * 0.4 // Moderate speed
            materialRef.current.uGlowColor = colors.glowColor
            materialRef.current.uBaseColor = colors.baseColor
            materialRef.current.uDotColor = colors.dotColor
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
