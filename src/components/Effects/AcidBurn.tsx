import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

// Acid Burn shader - DOT MATRIX / EXPANDING RIPPLES
// The visual is a grid of dots.
// An organic ring spawns at the center and expands outwards until it hits the edges.
const AcidBurnShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uGlowColor: new THREE.Color('#00d4ff'), // Cyan glow
        uBaseColor: new THREE.Color('#0a1628'), // Dark background
        uDotColor: new THREE.Color('#1f2937'), // Inactive dot color
        uSpeed: 0.4,      // Faster expansion
        uGridScale: 120.0, // Much denser grid (smaller dots)
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
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        
        float snoise(vec3 v){ 
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            
            vec3 i  = floor(v + dot(v, vec3(C.y)));
            vec3 x0 = v - i + dot(i, vec3(C.x));
            
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            
            vec3 x1 = x0 - i1 + C.x;
            vec3 x2 = x0 - i2 + C.y;
            vec3 x3 = x0 - D.yyy;
            
            i = mod(i, 289.0);
            vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                      
            float n_ = 1.0/7.0;
            vec3 ns = n_ * D.wyz - D.xzx;
            
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
            float time = uTime * uSpeed;
            
            // Grid UVs
            vec2 uv = vUv;
            uv.x *= uAspectRatio;
            
            vec2 gridUV = fract(uv * uGridScale); // 0-1 inside cell
            vec2 cellID = floor(uv * uGridScale);
            vec2 cellCenter = (cellID + 0.5) / uGridScale; // World pos of cell center
            
            // Centered UV for distance calc
            vec2 center = vec2(0.5 * uAspectRatio, 0.5);
            vec2 warpedP = cellCenter;
            
            // --- EXPANDING RIPPLE LOGIC ---
            // We want a ring that grows from 0 to >1.5 (offscreen)
            // Repeating periodically
            
            // Organic warp applied to the position before distance calc
            float angle = atan(warpedP.y - center.y, warpedP.x - center.x);
            float dist0 = length(warpedP - center);
            
            // Warp makes the ring non-circular
            float warp = snoise(vec3(angle * 2.5, dist0 * 1.0, time * 0.2)) * uWarp * 0.2;
            float dist = dist0 + warp;
            
            // Current radius of the expanding ring
            // loops every 1.0 unit of 'time'
            float loopTime = time; 
            float radius = fract(loopTime) * 1.5; // grows to covering screen
            
            // Ring width thickness
            float thickness = 0.15;
            
            // Field strength: 1.0 at ring, 0.0 elsewhere
            float field = 1.0 - smoothstep(0.0, thickness, abs(dist - radius));
            
            // Add a second staggered ring for complexity?
            // offset by 0.5 time
            float radius2 = fract(loopTime + 0.5) * 1.5;
            float field2 = 1.0 - smoothstep(0.0, thickness * 0.8, abs(dist - radius2));
            
            // Fade out the second ring slightly
            field = max(field, field2 * 0.7);
            
            // --- SCREEN EDGE GLOW ---
            // The user mentioned "joins the outer glow of the screen"
            // We'll create a permanent glow at the edges
            vec2 uvCentered = vUv - 0.5;
            uvCentered.x *= uAspectRatio;
            float edgeDist = length(uvCentered);
            float edgeGlow = smoothstep(0.5, 0.8, edgeDist);
            
            // Merge expanding ring into edge glow
            field = max(field, edgeGlow * 0.5);
            
            // --- DOT RENDERING ---
            float baseDotSize = 0.1 * uDotSize; // Tiny inactive dots
            float activeDotSize = 0.8 * uDotSize; // Large active dots
            
            float currentSize = mix(baseDotSize, activeDotSize, field);
            
            // Distance to center of dot
            float d = length(gridUV - 0.5);
            float alpha = 1.0 - smoothstep(currentSize - 0.05, currentSize + 0.05, d);
            
            // Color
            vec3 finalColor = mix(uDotColor, uGlowColor, field);
            finalColor += uGlowColor * field * 0.5; // bloom boost
            
            // Background
            vec3 bg = uBaseColor;
            
            // Render Dot
            vec3 pixel = mix(bg, finalColor, alpha);
            
            // Add Field Glow (behind dots)
            pixel += uGlowColor * field * 0.2;
            
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

    // Parse colors
    const colors = useMemo(() => ({
        glowColor: new THREE.Color(acidBurn.color1),
        baseColor: new THREE.Color(acidBurn.background),
        dotColor: new THREE.Color('#222'),
    }), [acidBurn.color1, acidBurn.background])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime
            // Default faster speed if user hasn't adjusted it yet
            // But we respect the store value. 
            // NOTE: Store value for speed might be low (0.15). User requested expanding rings which implies movement.
            // We'll scale the speed uniform slightly to ensure it moves visibly.
            materialRef.current.uSpeed = acidBurn.speed * 2.0

            materialRef.current.uGlowColor = colors.glowColor
            materialRef.current.uBaseColor = colors.baseColor
            materialRef.current.uDotColor = colors.dotColor

            // Dynamic Grid Scale based on viewport? Or just high default.
            // User complained "too zoomed in", so we want HIGHER grid scale (more small dots)
            materialRef.current.uGridScale = 120.0

            // Threshold controls dot size in previous logic, let's reuse it for Dot max size
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
