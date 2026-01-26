import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

// Acid Burn shader - expanding glowing outline rings/blobs
// Effect: Dark background with cyan glowing edges that expand and merge
const AcidBurnShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uGlowColor: new THREE.Color('#00d4ff'), // Cyan glow
        uBackground: new THREE.Color('#0a1628'), // Dark blue background
        uSpeed: 0.2,
        uRingWidth: 0.08,
        uRingCount: 3.0,
        uWarp: 0.3,
        uGlowIntensity: 1.5,
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
        uniform float uRingWidth;
        uniform float uRingCount;
        uniform float uWarp;
        uniform float uGlowIntensity;
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
        
        // Create a single expanding ring with organic shape
        float expandingRing(vec2 uv, vec2 center, float time, float offset, float warp) {
            // Distance from center
            vec2 d = uv - center;
            float dist = length(d);
            
            // Add organic wobble to the distance
            float angle = atan(d.y, d.x);
            float wobble = snoise(vec3(angle * 2.0, time * 0.3, offset)) * warp;
            wobble += snoise(vec3(angle * 4.0, time * 0.2, offset + 10.0)) * warp * 0.5;
            dist += wobble;
            
            // Expanding ring - grows over time, loops back
            float ringRadius = fract(time + offset) * 1.5; // 0 to 1.5, then reset
            float fade = 1.0 - fract(time + offset); // Fade as it expands
            
            // Ring edge detection
            float ringDist = abs(dist - ringRadius);
            float ring = 1.0 - smoothstep(0.0, uRingWidth, ringDist);
            
            // Apply fade so rings fade as they expand outward
            ring *= fade * fade;
            
            return ring;
        }
        
        void main() {
            float time = uTime * uSpeed;
            
            // Adjust UV for aspect ratio
            vec2 uv = vUv - 0.5;
            uv.x *= uAspectRatio;
            
            // Domain warp the UV for more organic feel
            float warpX = snoise(vec3(uv * 2.0, time * 0.3));
            float warpY = snoise(vec3(uv * 2.0 + 5.0, time * 0.25));
            uv += vec2(warpX, warpY) * uWarp * 0.3;
            
            // Multiple ring centers that drift slowly
            vec2 center1 = vec2(
                snoise(vec3(time * 0.15, 0.0, 0.0)) * 0.3,
                snoise(vec3(0.0, time * 0.15, 0.0)) * 0.3
            );
            vec2 center2 = vec2(
                snoise(vec3(time * 0.12 + 5.0, 0.0, 0.0)) * 0.4 + 0.2,
                snoise(vec3(0.0, time * 0.12 + 5.0, 0.0)) * 0.3 - 0.1
            );
            vec2 center3 = vec2(
                snoise(vec3(time * 0.1 + 10.0, 0.0, 0.0)) * 0.3 - 0.2,
                snoise(vec3(0.0, time * 0.1 + 10.0, 0.0)) * 0.4 + 0.1
            );
            
            // Create multiple staggered expanding rings per center
            float ring = 0.0;
            
            // Ring set 1 - from center1
            ring += expandingRing(uv, center1, time, 0.0, uWarp);
            ring += expandingRing(uv, center1, time, 0.33, uWarp);
            ring += expandingRing(uv, center1, time, 0.66, uWarp);
            
            // Ring set 2 - from center2
            ring += expandingRing(uv, center2, time * 0.8, 0.1, uWarp);
            ring += expandingRing(uv, center2, time * 0.8, 0.44, uWarp);
            ring += expandingRing(uv, center2, time * 0.8, 0.77, uWarp);
            
            // Ring set 3 - from center3
            if (uRingCount > 2.5) {
                ring += expandingRing(uv, center3, time * 1.1, 0.2, uWarp);
                ring += expandingRing(uv, center3, time * 1.1, 0.55, uWarp);
            }
            
            // Clamp and apply intensity
            ring = clamp(ring, 0.0, 1.0);
            ring *= uGlowIntensity;
            
            // Add outer glow (soft halo around rings)
            float glow = ring * 0.5 + pow(ring, 2.0) * 0.5;
            
            // Final color: dark background with glowing edges only
            vec3 color = uBackground;
            color += uGlowColor * glow;
            
            // Add subtle ambient glow around screen edges
            float edgeDist = max(abs(uv.x / uAspectRatio), abs(uv.y)) * 2.0;
            float edgeGlow = smoothstep(0.7, 1.0, edgeDist) * 0.3;
            color += uGlowColor * edgeGlow * 0.2;
            
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
            materialRef.current.uRingWidth = acidBurn.burnWidth
            materialRef.current.uRingCount = 3.0
            materialRef.current.uWarp = acidBurn.warp
            materialRef.current.uGlowIntensity = acidBurn.threshold // Reusing threshold as intensity
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
