import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

// Acid Burn shader - morphing organic blob outline with halftone pattern
// Creates a single hollow blob shape with glowing edges, like the Aura website
const AcidBurnShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uGlowColor: new THREE.Color('#00d4ff'), // Cyan glow
        uBackground: new THREE.Color('#0a1628'), // Dark blue background
        uSpeed: 0.15,
        uEdgeWidth: 0.12,
        uBlobSize: 0.4,
        uWarp: 0.4,
        uGlowIntensity: 1.2,
        uHalftoneScale: 80.0,
        uHalftoneStrength: 0.4,
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
        uniform vec3 uBackground;
        uniform float uSpeed;
        uniform float uEdgeWidth;
        uniform float uBlobSize;
        uniform float uWarp;
        uniform float uGlowIntensity;
        uniform float uHalftoneScale;
        uniform float uHalftoneStrength;
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
        
        // Halftone dot pattern
        float halftone(vec2 uv, float intensity, float scale) {
            vec2 grid = fract(uv * scale);
            float dot = length(grid - 0.5);
            return smoothstep(0.5 - intensity * 0.3, 0.5, dot);
        }
        
        void main() {
            float time = uTime * uSpeed;
            
            // Adjust UV for aspect ratio - center the blob
            vec2 uv = vUv - 0.5;
            uv.x *= uAspectRatio;
            
            // Offset the blob center slightly to the right (like in the screenshots)
            vec2 center = vec2(0.15, 0.0);
            center.x += snoise(vec3(time * 0.2, 0.0, 0.0)) * 0.1;
            center.y += snoise(vec3(0.0, time * 0.15, 0.0)) * 0.1;
            
            vec2 p = uv - center;
            
            // Distance from center
            float dist = length(p);
            
            // Get angle for organic deformation
            float angle = atan(p.y, p.x);
            
            // Multi-layered organic deformation of the blob shape
            float deform = 0.0;
            deform += snoise(vec3(angle * 2.0 + time * 0.3, dist * 3.0, time * 0.2)) * uWarp * 0.3;
            deform += snoise(vec3(angle * 3.0 + time * 0.2, dist * 2.0 + 5.0, time * 0.15)) * uWarp * 0.2;
            deform += snoise(vec3(angle * 5.0 + time * 0.4, dist * 4.0 + 10.0, time * 0.1)) * uWarp * 0.1;
            
            // Adjust distance based on deformation - creates organic blob shape
            float blobDist = dist + deform;
            
            // The blob ring - hollow inside with glowing edge
            float innerRadius = uBlobSize;
            float outerRadius = uBlobSize + uEdgeWidth;
            
            // Create the ring shape (hollow inside)
            float ring = smoothstep(innerRadius - 0.05, innerRadius, blobDist) 
                       - smoothstep(outerRadius, outerRadius + 0.08, blobDist);
            ring = max(ring, 0.0);
            
            // Add soft glow extending outward from the ring
            float outerGlow = 1.0 - smoothstep(outerRadius, outerRadius + 0.25, blobDist);
            outerGlow *= 0.5;
            
            // Add inner glow (subtle glow inside the hole)
            float innerGlow = smoothstep(innerRadius - 0.15, innerRadius, blobDist);
            innerGlow *= 0.3;
            
            // Combine ring and glows
            float glow = ring * uGlowIntensity + outerGlow * 0.6 + innerGlow * 0.2;
            glow = clamp(glow, 0.0, 1.5);
            
            // Apply halftone pattern
            vec2 halftoneUv = vUv;
            halftoneUv.x *= uAspectRatio;
            float dots = halftone(halftoneUv, glow, uHalftoneScale);
            
            // Mix halftone with solid glow based on strength
            float finalGlow = mix(glow, glow * (1.0 - dots * uHalftoneStrength), uHalftoneStrength);
            
            // Final color
            vec3 color = uBackground;
            color += uGlowColor * finalGlow;
            
            // Add subtle screen edge glow
            float edgeDist = max(abs(uv.x / uAspectRatio), abs(uv.y)) * 2.0;
            float edgeGlow = smoothstep(0.8, 1.0, edgeDist) * 0.15;
            color += uGlowColor * edgeGlow;
            
            gl_FragColor = vec4(color, 1.0);
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
        background: new THREE.Color(acidBurn.background),
    }), [acidBurn.color1, acidBurn.background])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime
            materialRef.current.uGlowColor = colors.glowColor
            materialRef.current.uBackground = colors.background
            materialRef.current.uSpeed = acidBurn.speed
            materialRef.current.uEdgeWidth = acidBurn.burnWidth
            materialRef.current.uBlobSize = acidBurn.threshold
            materialRef.current.uWarp = acidBurn.warp
            materialRef.current.uGlowIntensity = 1.2
            materialRef.current.uHalftoneScale = 80.0
            materialRef.current.uHalftoneStrength = 0.4
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
