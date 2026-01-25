import { useRef } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'

import { Color } from 'three'


const LavaMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor1: new Color('#ff0000'),
        uColor2: new Color('#00ff00'),
        uColor3: new Color('#0000ff'),
        uSpeed: 0.2,
        uThreshold: 0.5,
        uAspectRatio: 1.0,
        uKaleidoEnabled: 0.0,
        uKaleidoSegments: 6.0,
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
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uSpeed;
    uniform float uThreshold;
    uniform float uAspectRatio;
    uniform float uKaleidoEnabled;
    uniform float uKaleidoSegments;
    varying vec2 vUv;

    // Helper: Kaleidoscope
    vec2 kaleidoscope(vec2 uv, float segments) {
        vec2 centered = uv - 0.5;
        float r = length(centered);
        float a = atan(centered.y, centered.x);
        float segmentAngle = 3.14159 * 2.0 / segments;
        a = mod(a, segmentAngle);
        a = abs(a - segmentAngle/2.0);
        return vec2(cos(a), sin(a)) * r + 0.5;
    }

    void main() {
      vec2 uv = vUv;
      float ratio = uAspectRatio;
      
      // Kaleidoscope
      if (uKaleidoEnabled > 0.5) {
          uv = kaleidoscope(uv, uKaleidoSegments);
      }
      
      // Aspect Corrected UVs for calculations
      vec2 p = uv * 2.0 - 1.0; 
      p.x *= ratio;

      float time = uTime * uSpeed;

      // Blob positions (simple organic movement)
      // We simulate 5 blobs
      
      vec2 b1 = vec2(sin(time * 0.8), cos(time * 0.7)) * 0.5;
      vec2 b2 = vec2(sin(time * 1.1 + 2.0), cos(time * 1.3 + 1.0)) * 0.6;
      vec2 b3 = vec2(cos(time * 0.6 + 4.0), sin(time * 0.5 + 5.0)) * 0.4;
      vec2 b4 = vec2(sin(time * 1.2 + 1.0), cos(time * 0.9 + 4.0)) * 0.7;
      vec2 b5 = vec2(cos(time * 0.4 + 2.0), sin(time * 0.6 + 1.0)) * 0.3;

      // Metaball field calculation: sum(r / distance)
      float d1 = length(p - b1);
      float d2 = length(p - b2);
      float d3 = length(p - b3);
      float d4 = length(p - b4);
      float d5 = length(p - b5);

      // Inverse distance power
      float v = 0.0;
      v += 0.2 / d1;
      v += 0.25 / d2;
      v += 0.2 / d3;
      v += 0.15 / d4;
      v += 0.15 / d5;

      // Thresholding for hard edges vs smooth
      // We want a lava lamp look, so smooth gradient inside the blob is nice.
      // But distinctive shapes.
      
      // Smoothstep the volume
      // uThreshold controls "fatness"
      float alpha = smoothstep(uThreshold - 0.1, uThreshold + 0.1, v);
      
      // Coloring
      // Blend colors based on proximity to specific blobs
      // This is a simplification, but effective.
      
      vec3 col = vec3(0.0);
      
      // Influence factors for color mixing
      float i1 = 0.2/d1;
      float i2 = 0.25/d2;
      float i3 = 0.2/d3;
      
      float total = i1 + i2 + i3 + 0.001;
      
      col += uColor1 * (i1 / total);
      col += uColor2 * (i2 / total);
      col += uColor3 * (i3 / total);
      
      // Add a background color? Or just black?
      // Lava lamp usually floats in liquid.
      // We'll multiply by alpha to mask the shape.
      
      // Let's make the background a dark version of the mix, or black.
      vec3 bg = uColor1 * 0.05 + uColor2 * 0.05;
      
      vec3 final = mix(bg, col, alpha);
      
      // Add a little rim light feeling?
      // Gradient based on 'v' value
      float rim = smoothstep(uThreshold, uThreshold + 0.05, v) - smoothstep(uThreshold + 0.05, uThreshold + 0.2, v);
      final += vec3(0.5) * rim * 0.5;

      gl_FragColor = vec4(final, 1.0);
    }
  `
)

extend({ LavaMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            lavaMaterial: any
        }
    }
}

export default function LavaLamp() {
    const materialRef = useRef<any>(null)

    const { viewport } = useThree()
    // Scale up to cover edges
    const width = viewport.width
    const height = viewport.height
    const aspect = width / height

    // Leva Removed - Using hardcoded defaults for now as this mode is less critical
    const config = {
        color1: '#ff0055',
        color2: '#ffff00',
        color3: '#00ccff',
        speed: 0.3,
        threshold: 1.0,
        kaleidoscope: false,
        kSegments: 6
    }

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uTime = clock.getElapsedTime()
            materialRef.current.uAspectRatio = aspect
        }
    })

    return (
        <mesh scale={[width * 1.5, height * 1.5, 1]}>
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <lavaMaterial
                ref={materialRef}
                uColor1={new Color(config.color1)}
                uColor2={new Color(config.color2)}
                uColor3={new Color(config.color3)}
                uSpeed={config.speed}
                uThreshold={config.threshold}
                uKaleidoEnabled={config.kaleidoscope ? 1.0 : 0.0}
                uKaleidoSegments={config.kSegments}
            />
        </mesh>
    )
}
