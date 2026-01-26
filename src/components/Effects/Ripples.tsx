import { useRef } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

const RipplesMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#0081f7'),
        uBackgroundColor: new THREE.Color('#000000'),
        uSpeed: 0.2,
        uDensity: 40.0,
        uSpread: 0.15,
        uExpand: 0.0, // 0 = Static/Pulse, 1 = Expand
        uResolution: new THREE.Vector2(1, 1),
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
        uniform vec3 uColor;
        uniform vec3 uBackgroundColor;
        uniform float uSpeed;
        uniform float uDensity;
        uniform float uSpread;
        uniform float uExpand;
        uniform vec2 uResolution;
        
        varying vec2 vUv;
        
        // Simplex Noise (IQ style)
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

        // Box SDF for the square dots
        float sdBox(in vec2 p, in vec2 b) {
            vec2 d = abs(p)-b;
            return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
        }

        void main() {
            vec2 uv = vUv;
            float aspect = uResolution.x / uResolution.y;
            uv.x *= aspect;
            
            // Grid Logic
            vec2 gridUv = uv * uDensity;
            vec2 cellId = floor(gridUv);
            vec2 cellUv = fract(gridUv) - 0.5;
            
            vec2 centerNorm = cellId / uDensity;
            
            float time = uTime * uSpeed;
            
            // Base Center
            vec2 center = vec2(0.5 * aspect, 0.5);
            float dist = length(centerNorm - center);
            
            // Radius Logic
            // If Expand mode is active (uExpand > 0.5), we modulate radius with time
            float baseRadius = 0.35;
            if (uExpand > 0.5) {
                // Expanding loop
                // 0 to 1.5 radius (covers screen corners)
                baseRadius = fract(time * 0.5) * 1.5;
            }
            
            // Domain Warping
            float noise = snoise(centerNorm * 3.0 + time * 0.5);
            
            // Add noise to the target radius
            float radius = baseRadius + noise * 0.1;
            
            // Field Calculation
            float field = abs(dist - radius);
            
            // Dot Size
            float size = 1.0 - smoothstep(0.0, uSpread, field);
            size = clamp(size, 0.0, 0.9); 
            
            // Draw Square
            float box = sdBox(cellUv, vec2(size * 0.5));
            float mask = 1.0 - smoothstep(0.0, 0.05, box);
            
            // Color Logic
            vec3 col = mix(uColor, vec3(0.8, 1.0, 1.0), size * size);
            
            // Final Mix
            vec3 finalColor = mix(uBackgroundColor, col, mask);
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
)

extend({ RipplesMaterial })

export default function Ripples() {
    const materialRef = useRef<any>(null)
    const { ripples } = useStore()
    const { viewport, size } = useThree()

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uTime = clock.getElapsedTime()
            materialRef.current.uColor = new THREE.Color(ripples.color)
            materialRef.current.uBackgroundColor = new THREE.Color(ripples.backgroundColor || '#000000')
            materialRef.current.uSpeed = ripples.speed
            materialRef.current.uDensity = ripples.cellDensity
            materialRef.current.uSpread = ripples.spread
            materialRef.current.uExpand = ripples.effectType === 'Expand' ? 1.0 : 0.0
            materialRef.current.uResolution = new THREE.Vector2(size.width, size.height)
        }
    })

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <ripplesMaterial ref={materialRef} />
        </mesh>
    )
}
