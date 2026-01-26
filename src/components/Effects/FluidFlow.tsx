import { useRef } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

// Fluid Flow Shader - PAINT MIXING style
// - Removed grain (frosted look)
// - Deep domain warping for swirly "oil paint" effect
const FluidFlowMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor1: new THREE.Color('#38bdf8'),
        uColor2: new THREE.Color('#e879f9'),
        uColor3: new THREE.Color('#34d399'),
        uColor4: new THREE.Color('#fbbf24'),
        uBackground: new THREE.Color('#0f172a'),
        uSpeed: 0.2,
        uDensity: 1.5, // Higher density for paint streaks
        uStrength: 0.6,
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
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform vec3 uBackground;
        uniform float uSpeed;
        uniform float uDensity;
        uniform float uStrength;
        uniform float uAspectRatio;
        
        varying vec2 vUv;
        
        // Simplex Noise
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
            vec2 uv = vUv;
            uv.x *= uAspectRatio;
            float time = uTime * uSpeed;
            
            // Domain Warping - "Paint Mixing"
            // We do a triple warp to get that swirly liquid look
            // f(p) = fbm( p + fbm( p + fbm( p ) ) )
            
            float scale = uDensity * 0.8;
            
            // Layer 1
            vec2 q = vec2(0.0);
            q.x = snoise(uv * scale + time * 0.1);
            q.y = snoise(uv * scale + time * 0.12 + 4.0);
            
            // Layer 2
            vec2 r = vec2(0.0);
            r.x = snoise(uv * scale + q * 2.0 + time * 0.2 + vec2(1.7, 9.2));
            r.y = snoise(uv * scale + q * 2.0 + time * 0.2 + vec2(8.3, 2.8));
            
            // Layer 3 (Deep liquid)
            // Use 'r' to distort the final coordinate
            vec2 warped = uv + r * uStrength * 1.5;
            
            // Calculate pattern for mixing
            // Higher frequency detail
            float fluid = snoise(warped * 2.0 - time * 0.1);
            
            // Normalize
            fluid = fluid * 0.5 + 0.5; 
            
            // Color Mapping
            // We map the 0-1 fluid value to a palette
            // To look like paint, we want swirls of distinct colors
            
            vec3 color = uBackground;
            
            // Create "ribbons" using sine waves on the fluid value
            // This creates bands of color that follow the warp
            
            float ribbon1 = sin(fluid * 10.0 + time) * 0.5 + 0.5;
            float ribbon2 = sin(fluid * 15.0 - time * 0.5 + 2.0) * 0.5 + 0.5;
            float ribbon3 = snoise(warped * 3.0 + vec2(time)); // More chaotic mix
            
            // Base layer
            color = mix(color, uColor1, smoothstep(0.2, 0.6, fluid));
            
            // Streaks of other colors
            color = mix(color, uColor2, smoothstep(0.4, 0.7, ribbon1) * 0.8);
            color = mix(color, uColor3, smoothstep(0.4, 0.7, ribbon2) * 0.8);
            
            // Accent
            // Sharp thin lines for detail?
            float detail = smoothstep(0.48, 0.52, abs(ribbon3));
            color = mix(color, uColor4, detail * 0.5);
            
            // NO GRAIN - Clean, glossy paint look
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
)

extend({ FluidFlowMaterial })

export default function FluidFlow() {
    const materialRef = useRef<any>(null)
    const { fluid } = useStore()
    const { viewport } = useThree()
    const aspect = viewport.width / viewport.height

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uTime = clock.getElapsedTime()
            materialRef.current.uColor1 = new THREE.Color(fluid.color1)
            materialRef.current.uColor2 = new THREE.Color(fluid.color2)
            materialRef.current.uColor3 = new THREE.Color(fluid.color3)
            materialRef.current.uColor4 = new THREE.Color(fluid.color4)
            materialRef.current.uBackground = new THREE.Color(fluid.background)
            materialRef.current.uSpeed = fluid.speed
            materialRef.current.uDensity = fluid.density
            materialRef.current.uStrength = fluid.strength
            materialRef.current.uAspectRatio = aspect
        }
    })

    return (
        <mesh scale={[viewport.width * 1.5, viewport.height * 1.5, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <fluidFlowMaterial ref={materialRef} />
        </mesh>
    )
}
