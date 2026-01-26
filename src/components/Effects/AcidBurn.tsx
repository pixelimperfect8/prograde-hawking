import { useRef, useMemo } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

// Acid Burn shader - DOT MATRIX / FORCE FIELD version
// The visual is a grid of dots that scale/glow to form the organic ring shape
const AcidBurnShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uGlowColor: new THREE.Color('#00d4ff'), // Cyan glow
        uBaseColor: new THREE.Color('#0a1628'), // Dark background
        uDotColor: new THREE.Color('#1f2937'), // Inactive dot color
        uSpeed: 0.2,
        uGridScale: 60.0, // How many dots across
        uDotSize: 0.5,    // Base dot size
        uWarp: 0.3,
        uThreshold: 0.5,
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
        uniform float uDotSize; // Max size relative to cell
        uniform float uWarp;
        uniform float uThreshold; // Controls ring thickness/size
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
            
            // Grid Setup
            vec2 uv = vUv;
            uv.x *= uAspectRatio;
            
            // Cell coordinates from 0 to 1 within each grid cell
            vec2 gridUV = fract(uv * uGridScale);
            
            // ID of the cell - used for noise sampling so the whole dot moves together
            vec2 cellID = floor(uv * uGridScale);
            vec2 cellCenter = (cellID + 0.5) / uGridScale; // Normalized position of cell center
            
            // --- FIELD CALCULATION (Sampled at Cell Center) ---
            
            // Organic movement of the center
            vec2 organicCenter = vec2(0.5 * uAspectRatio, 0.5);
            organicCenter.x += snoise(vec3(time * 0.2, 0.0, 0.0)) * 0.15;
            organicCenter.y += snoise(vec3(0.0, time * 0.15, 0.0)) * 0.15;
            
            // Domain warp for the ring shape
            vec2 warpP = cellCenter - organicCenter;
            float angle = atan(warpP.y, warpP.x);
            float dist = length(warpP);
            
            // Warp the distance field
            float warp = snoise(vec3(angle * 2.5 + time * 0.2, dist * 2.0, time * 0.1)) * uWarp;
            warp += snoise(vec3(angle * 5.0 - time * 0.1, dist * 5.0, time * 0.2)) * uWarp * 0.5;
            
            float warpedDist = dist + warp * 0.2;
            
            // Calculate "Ring Field" value (0 to 1)
            // Peak at the ring radius, fall off to sides
            float midRadius = 0.35; // Base radius size
            float ringWidth = 0.15 * uThreshold;
            
            float fieldObj = 1.0 - smoothstep(0.0, ringWidth, abs(warpedDist - midRadius));
            
            // Add a second, thinner outer ring
            float fieldObj2 = 1.0 - smoothstep(0.0, ringWidth * 0.5, abs(warpedDist - (midRadius + 0.15)));
            fieldObj = max(fieldObj, fieldObj2 * 0.5);
            
            // --- DOT RENDERING ---
            
            // Dot size modulation
            // Base dots are small
            float currentDotSize = 0.15 * uDotSize;
            
            // Active dots (in the ring) are larger
            currentDotSize += fieldObj * 0.6 * uDotSize;
            
            // Distance from center of current grid cell
            float d = length(gridUV - 0.5);
            
            // Draw dot
            float dotMask = 1.0 - smoothstep(currentDotSize - 0.05, currentDotSize + 0.05, d);
            
            // Color modulation
            vec3 activeColor = uGlowColor;
            vec3 inactiveColor = uDotColor;
            
            // Mix color based on field strength
            vec3 dotColor = mix(inactiveColor, activeColor, fieldObj);
            
            // Brightness boost for active dots
            dotColor += activeColor * fieldObj * 1.5;
            
            // Final composite
            vec3 finalColor = uBaseColor; // Background
            
            // Add dots on top
            finalColor = mix(finalColor, dotColor, dotMask);
            
            // Add subtle glow around active area (behind dots)
            float glowMask = fieldObj * 0.3;
            finalColor += uGlowColor * glowMask;
            
            gl_FragColor = vec4(finalColor, 1.0);
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
        dotColor: new THREE.Color('#1f2937'), // Dark grey/blue for inactive dots
    }), [acidBurn.color1, acidBurn.background])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime
            materialRef.current.uGlowColor = colors.glowColor
            materialRef.current.uBaseColor = colors.baseColor
            materialRef.current.uDotColor = colors.dotColor
            materialRef.current.uSpeed = acidBurn.speed
            materialRef.current.uGridScale = 60.0 // Fixed dense grid
            materialRef.current.uDotSize = acidBurn.threshold * 1.5 // Map threshold to dot size scale
            materialRef.current.uWarp = acidBurn.warp
            materialRef.current.uThreshold = acidBurn.burnWidth * 5.0 // Map burn width to ring thickness
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
