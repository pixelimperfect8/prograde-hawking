import { useRef } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store'
import { shaderMaterial } from '@react-three/drei'

// Define the shader material
const LiquidShaderMaterial = shaderMaterial(
    {
        time: 0,
        resolution: new THREE.Vector2(),
        scale: 0.4,
        ax: 5.0, ay: 7.0, az: 9.0, aw: 13.0,
        bx: 1.0, by: 1.0,
        color1: new THREE.Color('#ffffff'),
        color2: new THREE.Color('#ffafaf'),
        color3: new THREE.Color('#0099ff'),
        color4: new THREE.Color('#aaffff'),
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment Shader (Ported from User Reference)
    `
    precision highp float;
    varying vec2 vUv;
    uniform float time;
    uniform float scale;
    uniform vec2 resolution;
    uniform vec3 color1, color2, color3, color4;
    uniform float ax, ay, az, aw;
    uniform float bx, by;
    
    // just a bunch of sin & cos to generate an interesting pattern
    float cheapNoise(vec3 stp) {
      vec3 p = vec3(stp.st, stp.p);
      vec4 a = vec4(ax, ay, az, aw);
      return mix(
        sin(p.z + p.x * a.x + cos(p.x * a.x - p.z)) * 
        cos(p.z + p.y * a.y + cos(p.y * a.x + p.z)),
        sin(1. + p.x * a.z + p.z + cos(p.y * a.w - p.z)) * 
        cos(1. + p.y * a.w + p.z + cos(p.x * a.x + p.z)), 
        .436
      );
    }
    
    void main() {
      vec2 aR = vec2(resolution.x/resolution.y, 1.);
      vec2 st = vUv * aR * scale;
      float S = sin(time * .005);
      float C = cos(time * .005);
      vec2 v1 = vec2(cheapNoise(vec3(st, 2.)), cheapNoise(vec3(st, 1.)));
      vec2 v2 = vec2(
        cheapNoise(vec3(st + bx*v1 + vec2(C * 1.7, S * 9.2), 0.15 * time)),
        cheapNoise(vec3(st + by*v1 + vec2(S * 8.3, C * 2.8), 0.126 * time))
      );
      float n = .5 + .5 * cheapNoise(vec3(st + v2, 0.));
      
      vec3 color = mix(color1,
        color2,
        clamp((n*n)*8.,0.0,1.0));

      color = mix(color,
        color3,
        clamp(length(v1),0.0,1.0));

      color = mix(color,
                color4,
                clamp(length(v2.x),0.0,1.0));
      
      gl_FragColor = vec4(color, 1.0);
    }
    `
)

extend({ LiquidShaderMaterial })

declare module '@react-three/fiber' {
    interface ThreeElements {
        liquidShaderMaterial: any
    }
}

export default function LiquidMetal() {
    const materialRef = useRef<any>(null)
    const { liquidMetal } = useStore()
    const { viewport, size } = useThree()

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.time = clock.getElapsedTime() * 10.0 * liquidMetal.speed
            materialRef.current.scale = liquidMetal.distortion
            materialRef.current.ax = 5.0 + liquidMetal.metalness
            materialRef.current.ay = 7.0 + liquidMetal.metalness * 0.5
            materialRef.current.bx = liquidMetal.roughness
            materialRef.current.by = liquidMetal.roughness

            // Colors
            if (liquidMetal.colors[0]) materialRef.current.color1.set(liquidMetal.colors[0])
            if (liquidMetal.colors[1]) materialRef.current.color2.set(liquidMetal.colors[1])
            else if (liquidMetal.colors[0]) materialRef.current.color2.set(liquidMetal.colors[0])

            if (liquidMetal.colors[2]) materialRef.current.color3.set(liquidMetal.colors[2])
            else if (liquidMetal.colors[0]) materialRef.current.color3.set(liquidMetal.colors[0])

            if (liquidMetal.colors[3]) materialRef.current.color4.set(liquidMetal.colors[3])
            else if (liquidMetal.colors[0]) materialRef.current.color4.set(liquidMetal.colors[0])

            materialRef.current.resolution.set(size.width, size.height)
        }
    })

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <liquidShaderMaterial ref={materialRef} />
        </mesh>
    )
}
