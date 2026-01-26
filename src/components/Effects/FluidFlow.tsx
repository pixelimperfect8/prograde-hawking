import { useRef } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

// Fluid Flow Shader - SMOOTH Unicorn Studio style
// - Lower noise frequency for larger, smoother blobs
// - Slower, more liquid movement
const FluidFlowMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor1: new THREE.Color('#38bdf8'),
        uColor2: new THREE.Color('#e879f9'),
        uColor3: new THREE.Color('#34d399'),
        uColor4: new THREE.Color('#fbbf24'),
        uBackground: new THREE.Color('#0f172a'),
        uSpeed: 0.2,
        uDensity: 1.0,
        uStrength: 0.4,
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
        
        // Grain noise
        float noise(vec2 p) {
            vec2 ip = floor(p);
            vec2 u = fract(p);
            u = u*u*(3.0-2.0*u);
            float res = mix(
                mix(fract(sin(dot(ip,vec2(12.9898,78.233)))*43758.5453),
                    fract(sin(dot(ip+vec2(1.0,0.0),vec2(12.9898,78.233)))*43758.5453),u.x),
                mix(fract(sin(dot(ip+vec2(0.0,1.0),vec2(12.9898,78.233)))*43758.5453),
                    fract(sin(dot(ip+vec2(1.0,1.0),vec2(12.9898,78.233)))*43758.5453),u.x),u.y);
            return res*res;
        }

        void main() {
            vec2 uv = vUv;
            uv.x *= uAspectRatio;
            float time = uTime * uSpeed;
            
            // Domain Warping - SMOOTHED OUT
            // Lower frequency for noise inputs (0.6 instead of 1.0 default density multiplier inside warp)
            float d = uDensity * 0.6;
            
            vec2 q = vec2(0.0);
            q.x = snoise(uv * d + time * 0.15);
            q.y = snoise(uv * d + time * 0.17 + 4.0);
            
            vec2 r = vec2(0.0);
            r.x = snoise(uv * d + q * 1.0 + time * 0.2 + vec2(1.7, 9.2));
            r.y = snoise(uv * d + q * 1.0 + time * 0.2 + vec2(8.3, 2.8));
            
            vec2 warpedUV = uv + r * uStrength;
            
            // Color Mixing Pattern - Smoother step
            
            float mix1 = snoise(warpedUV * 1.0 - time * 0.1); 
            float mix2 = snoise(warpedUV * 1.5 + time * 0.15); 
            
            mix1 = mix1 * 0.5 + 0.5;
            mix2 = mix2 * 0.5 + 0.5;
            
            vec3 color = uBackground;
            
            // Softer transitions (smoothstep wider range)
            color = mix(color, uColor1, smoothstep(0.2, 0.9, mix1) * 0.9);
            color = mix(color, uColor2, smoothstep(0.3, 0.95, mix2) * 0.8);
            
            float mix3 = snoise(warpedUV * 1.8 - time * 0.2 + vec2(4.0));
            mix3 = mix3 * 0.5 + 0.5;
            color = mix(color, uColor3, smoothstep(0.25, 0.9, mix3) * 0.7);
            
            float mix4 = snoise(warpedUV * 2.2 + time * 0.1 + vec2(8.0));
            mix4 = mix4 * 0.5 + 0.5;
            color = mix(color, uColor4, smoothstep(0.5, 0.98, mix4) * 0.6);
            
            // Grain Overlay - slightly reduced
            float grainStr = 0.05;
            float g = noise(uv * 800.0 + time * 10.0);
            color += (g - 0.5) * grainStr;
            
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
