import { useRef } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

// Acid Trip Shader - PAINT MIXING style
// - Added Smoothing control
// - Added Complexity control
const AcidTripMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor1: new THREE.Color('#38bdf8'),
        uColor2: new THREE.Color('#e879f9'),
        uColor3: new THREE.Color('#34d399'),
        uColor4: new THREE.Color('#fbbf24'),
        uBackground: new THREE.Color('#0f172a'),
        uSpeed: 0.2,
        uDensity: 1.5,
        uStrength: 0.6,
        uSmoothing: 0.5,
        uComplexity: 1.0, // New prop
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
        uniform float uSmoothing;
        uniform float uComplexity;
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
            vec2 warped = uv + r * uStrength * 1.5;
            
            // Mixing pattern
            float fluid = snoise(warped * 2.0 - time * 0.1);
            fluid = fluid * 0.5 + 0.5; 
            
            // Color Ribbons
            // Complexity controls the frequency of these waves
            float ribbonFreq = 10.0 * uComplexity;
            float ribbon1 = sin(fluid * ribbonFreq + time) * 0.5 + 0.5;
            float ribbon2 = sin(fluid * (ribbonFreq * 1.5) - time * 0.5 + 2.0) * 0.5 + 0.5;
            float ribbon3 = snoise(warped * (3.0 * uComplexity) + vec2(time)); 
            
            // Smoothing Logic
            float sm = mix(0.01, 0.8, uSmoothing * 0.5);
            float smHalf = sm * 0.5;
            
            vec3 color = uBackground;
            
            // Base layer
            color = mix(color, uColor1, smoothstep(0.5 - smHalf, 0.5 + smHalf, fluid));
            
            // Streaks
            color = mix(color, uColor2, smoothstep(0.5 - smHalf, 0.5 + smHalf, ribbon1) * 0.8);
            color = mix(color, uColor3, smoothstep(0.5 - smHalf, 0.5 + smHalf, ribbon2) * 0.8);
            
            // Accent
            float detailWidth = mix(0.02, 0.2, uSmoothing);
            float detail = smoothstep(0.5 - detailWidth, 0.5 + detailWidth, abs(ribbon3));
            color = mix(color, uColor4, (1.0 - detail) * 0.5);
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
)

extend({ AcidTripMaterial })

export default function AcidTrip() {
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
            materialRef.current.uSmoothing = fluid.smoothing
            materialRef.current.uComplexity = fluid.complexity || 1.0
            materialRef.current.uAspectRatio = aspect
        }
    })

    return (
        <mesh scale={[viewport.width * 1.5, viewport.height * 1.5, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <acidTripMaterial ref={materialRef} />
        </mesh>
    )
}
