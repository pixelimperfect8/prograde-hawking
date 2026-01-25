import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

// Orbs shader - soft floating gradient orbs with blur
const OrbsShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor1: new THREE.Color('#4f46e5'), // Indigo
        uColor2: new THREE.Color('#7c3aed'), // Violet
        uColor3: new THREE.Color('#06b6d4'), // Cyan
        uColor4: new THREE.Color('#8b5cf6'), // Purple
        uSpeed: 0.3,
        uBlur: 0.4,
        uScale: 1.0,
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
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform float uSpeed;
        uniform float uBlur;
        uniform float uScale;
        
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
        
        // Soft orb function
        float orb(vec2 uv, vec2 center, float radius, float blur) {
            float dist = length(uv - center);
            return smoothstep(radius + blur, radius - blur * 0.5, dist);
        }
        
        void main() {
            vec2 uv = vUv;
            float time = uTime * uSpeed;
            
            // Orb centers - slowly orbiting/drifting positions
            vec2 center1 = vec2(
                0.3 + sin(time * 0.7) * 0.2 + snoise(vec3(time * 0.3, 0.0, 0.0)) * 0.1,
                0.4 + cos(time * 0.5) * 0.2 + snoise(vec3(0.0, time * 0.3, 0.0)) * 0.1
            );
            vec2 center2 = vec2(
                0.7 + sin(time * 0.5 + 2.0) * 0.2 + snoise(vec3(time * 0.4, 1.0, 0.0)) * 0.1,
                0.6 + cos(time * 0.6 + 1.0) * 0.2 + snoise(vec3(1.0, time * 0.4, 0.0)) * 0.1
            );
            vec2 center3 = vec2(
                0.5 + sin(time * 0.4 + 4.0) * 0.3 + snoise(vec3(time * 0.2, 2.0, 0.0)) * 0.15,
                0.3 + cos(time * 0.7 + 2.0) * 0.2 + snoise(vec3(2.0, time * 0.2, 0.0)) * 0.1
            );
            vec2 center4 = vec2(
                0.4 + sin(time * 0.6 + 1.5) * 0.25,
                0.7 + cos(time * 0.4 + 3.0) * 0.2
            );
            
            // Scale orbs
            float scale = uScale;
            
            // Create soft orbs with heavy blur
            float blur = uBlur;
            float orb1 = orb(uv, center1, 0.25 * scale, blur);
            float orb2 = orb(uv, center2, 0.3 * scale, blur);
            float orb3 = orb(uv, center3, 0.35 * scale, blur);
            float orb4 = orb(uv, center4, 0.2 * scale, blur);
            
            // Blend colors - additive style for glow
            vec3 color = vec3(0.0);
            color += uColor1 * orb1 * 0.8;
            color += uColor2 * orb2 * 0.7;
            color += uColor3 * orb3 * 0.6;
            color += uColor4 * orb4 * 0.5;
            
            // Background color (dark)
            vec3 bg = vec3(0.02, 0.02, 0.05);
            
            // Mix with background
            float totalOrb = min(orb1 + orb2 + orb3 + orb4, 1.0);
            color = mix(bg, color, clamp(totalOrb * 1.5, 0.0, 1.0));
            
            // Add subtle color shifting with noise
            float colorShift = snoise(vec3(uv * 2.0, time * 0.2)) * 0.1;
            color += colorShift * 0.05;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
)

extend({ OrbsShaderMaterial })

// Type declaration for JSX
declare global {
    namespace JSX {
        interface IntrinsicElements {
            orbsShaderMaterial: any
        }
    }
}

export default function Orbs() {
    const meshRef = useRef<THREE.Mesh>(null)
    const materialRef = useRef<any>(null)
    const { orbs } = useStore()

    // Parse colors
    const colors = useMemo(() => ({
        color1: new THREE.Color(orbs.color1),
        color2: new THREE.Color(orbs.color2),
        color3: new THREE.Color(orbs.color3),
        color4: new THREE.Color(orbs.color4),
    }), [orbs.color1, orbs.color2, orbs.color3, orbs.color4])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime
            materialRef.current.uColor1 = colors.color1
            materialRef.current.uColor2 = colors.color2
            materialRef.current.uColor3 = colors.color3
            materialRef.current.uColor4 = colors.color4
            materialRef.current.uSpeed = orbs.speed
            materialRef.current.uBlur = orbs.blur
            materialRef.current.uScale = orbs.scale
        }
    })

    return (
        <mesh ref={meshRef} scale={[10, 10, 1]}>
            <planeGeometry args={[1, 1, 1, 1]} />
            {/* @ts-ignore - Custom shader material */}
            <orbsShaderMaterial ref={materialRef} />
        </mesh>
    )
}
