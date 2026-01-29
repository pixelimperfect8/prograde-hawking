
import { useRef } from 'react'
import { useStore } from '../../store'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Standard GLSL noise (simplex)
const noiseGLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
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
`

const IntelligenceGlowMaterial = shaderMaterial(
    {
        uColor1: new THREE.Color('#2952ff'),
        uColor2: new THREE.Color('#d15beb'),
        uColor3: new THREE.Color('#ff295c'),
        uColor4: new THREE.Color('#ffc640'),
        uTime: 0,
        uSpeed: 0.5,
        uPulseSpeed: 1.0,
        uThickness: 0.15,
        uNoiseScale: 2.0,
        uDistortion: 1.0,
        uAspect: 1.0
    },
    // Vertex
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment
    `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uPulseSpeed;
    uniform float uThickness;
    uniform float uNoiseScale;
    uniform float uDistortion;
    uniform float uAspect;
    varying vec2 vUv;

    ${noiseGLSL}

    void main() {
        vec2 uv = vUv;
        
        // Correct Aspect for noise
        vec2 noiseUV = uv;
        noiseUV.x *= uAspect;

        // Create organic movement logic
        float t = uTime * uSpeed;
        
        // Displace the UVs slightly for the "Morphing" shape feel
        float n1 = snoise(noiseUV * uNoiseScale + t);
        float n2 = snoise(noiseUV * uNoiseScale * 0.5 - t * 0.5);
        
        vec2 distortedUV = uv + vec2(n1, n2) * uDistortion * 0.05;

        // Calculate Box Distance (0 at center, 1 at edge)
        // We use the aspect-corrected distance logic mainly for the thickness if desired,
        // but for a border stroke, we usually want it relative to the frame.
        
        // Standard normalized coordinates -0.5 to 0.5
        vec2 p = distortedUV - 0.5;
        
        // Normalize thickness based on aspect so it looks even? 
        // Simple approach: max(abs(x), abs(y)) * 2.0 => 0..1
        float dist = max(abs(p.x), abs(p.y)) * 2.0;

        // Create the glow mask
        // We want 1.0 at edge, fading inwards.
        // Threshold: 1.0 - uThickness
        // Smoothstep for soft glow
        float mask = smoothstep(1.0 - uThickness - 0.1, 1.0, dist);
        
        // Hard cutoff at 1.0 (screen edge)? Or let it clip naturally.
        // Let's add intensity near the very edge.
        mask = pow(mask, 3.0); // Curve it to be sharp at edge

        // Breathing/Pulse effect
        // Modulate alpha/intensity over time
        float breath = 0.5 + 0.5 * sin(uTime * uPulseSpeed);
        // Make it subtle
        float strength = 0.8 + 0.2 * breath;
        
        // Color Blending
        // We can use polar coordinates or noise to mix colors around the border
        float angle = atan(p.y, p.x);
        float noiseAngle = snoise(vec2(angle * 2.0, t * 0.2)); // Rotate colors slightly
        
        // Parametric mixing
        // Base mix
        vec3 cA = mix(uColor1, uColor2, sin(distortedUV.x * 3.14 + t) * 0.5 + 0.5);
        vec3 cB = mix(uColor3, uColor4, cos(distortedUV.y * 3.14 + t * 0.8) * 0.5 + 0.5);
        
        // Compose final color
        vec3 finalColor = mix(cA, cB, 0.5 + 0.5 * n1);
        
        // Boost vibrancy
        finalColor *= 1.2;

        gl_FragColor = vec4(finalColor, mask * strength);
    }
    `
)

extend({ IntelligenceGlowMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            intelligenceGlowMaterial: any
        }
    }
}

export default function IntelligenceGlow() {
    const materialRef = useRef<any>(null)
    const { intelligenceGlow } = useStore()
    const { viewport } = useThree()

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uTime = clock.getElapsedTime()
            materialRef.current.uColor1 = new THREE.Color(intelligenceGlow.color1)
            materialRef.current.uColor2 = new THREE.Color(intelligenceGlow.color2)
            materialRef.current.uColor3 = new THREE.Color(intelligenceGlow.color3)
            materialRef.current.uColor4 = new THREE.Color(intelligenceGlow.color4)
            materialRef.current.uSpeed = intelligenceGlow.speed
            materialRef.current.uPulseSpeed = intelligenceGlow.pulseSpeed
            materialRef.current.uThickness = intelligenceGlow.thickness
            materialRef.current.uNoiseScale = intelligenceGlow.noiseScale
            materialRef.current.uDistortion = intelligenceGlow.distortion
            materialRef.current.uAspect = viewport.width / viewport.height
        }
    })

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <intelligenceGlowMaterial
                ref={materialRef}
                transparent
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    )
}
