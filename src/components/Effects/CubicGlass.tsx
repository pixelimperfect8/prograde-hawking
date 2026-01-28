import { useRef } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store'
import { shaderMaterial } from '@react-three/drei'

const CubicGlassMaterial = shaderMaterial(
    {
        time: 0,
        resolution: new THREE.Vector2(),
        gridSize: 30.0,
        speed: 0.5,
        smoothness: 0.2,
        color1: new THREE.Color('#ff00ea'),
        color2: new THREE.Color('#ffce00'),
        color3: new THREE.Color('#00e5ff'),
        color4: new THREE.Color('#ffffff'),
        color5: new THREE.Color('#000000'),
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
    varying vec2 vUv;
    uniform float time;
    uniform vec2 resolution;
    uniform float gridSize;
    uniform float smoothness;
    uniform vec3 color1, color2, color3, color4, color5;
    
    // Simplex noise / Random function
    vec3 hash33(vec3 p3) {
        p3 = fract(p3 * vec3(.1031, .1030, .0973));
        p3 += dot(p3, p3.yxz + 33.33);
        return fract((p3.xxy + p3.yxx) * p3.zyx);
    }

    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod(i, 289.0);
        vec4 p = vec4(0.0); // Placeholder for permute logic if needed, using simple hash instead below for speed or just inline snoise logic
        // Actually let's use a simpler value noise for the "Cubic" look, it feels more appropriate
        return 0.0; 
    }
    
    // Gradient Noise 3D
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise_grad(vec3 v){
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod(i, 289.0);
        vec4 p = vec4(0.0);
        // ... standard simplex noise is long, let's use a domain warped fbm
        return 0.5;
    }

    // Hash function for pseudo-randomness
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
        }
        return v;
    }
    
    void main() {
        vec2 uv = vUv;
        
        // 1. Grid Quantization (The "Cubic" effect)
        float grid = gridSize;
        vec2 gridUV = floor(uv * grid) / grid;
        
        // 2. Animated Noise Field sampled at the GRID CENTER
        // Using gridUV ensures every pixel in the block gets the same noise value
        
        float t = time * 0.2;
        
        // Domain Warping for fluid look
        vec2 q = vec2(0.);
        q.x = fbm(gridUV + vec2(0.0, 0.0) + t);
        q.y = fbm(gridUV + vec2(5.2, 1.3) + t);
        
        vec2 r = vec2(0.);
        r.x = fbm(gridUV + 4.0 * q + vec2(1.7, 9.2) + t);
        r.y = fbm(gridUV + 4.0 * q + vec2(8.3, 2.8) + t);
        
        float f = fbm(gridUV + 4.0 * r + t);
        
        // 3. Color Mixing based on noise value 'f' (0.0 to 1.0)
        // We create a heatmap-like gradient
        
        vec3 col = color1;
        col = mix(col, color2, clamp(f * 2.5, 0.0, 1.0));
        col = mix(col, color3, clamp((f - 0.4) * 3.0, 0.0, 1.0));
        col = mix(col, color4, clamp((f - 0.7) * 4.0, 0.0, 1.0));
        col = mix(col, color5, clamp((f - 0.9) * 5.0, 0.0, 1.0));
        
        // 4. Smoothness / Block Edges
        // If smoothness > 0, we mix the hard grid result with a smooth non-grid result
        // OR we apply a vignette to each block to make it look like a tile?
        
        // Let's visualize the block borders slightly?
        vec2 gridPos = fract(uv * grid);
        // Distance from center of block
        float dist = max(abs(gridPos.x - 0.5), abs(gridPos.y - 0.5));
        
        // Glassy Edge Highlight
        // If we are near the edge (dist > 0.45), add a slight highlight/shadow
        float edge = smoothstep(0.4, 0.5, dist);
        // Invert edge for highlight logic
        
        // Make blocks look slightly 3D?
        // simple bevel
        col *= 1.0 - edge * (1.0 - smoothness);
        
        gl_FragColor = vec4(col, 1.0);
    }
    `
)

extend({ CubicGlassMaterial })

declare module '@react-three/fiber' {
    interface ThreeElements {
        cubicGlassMaterial: any
    }
}

export default function CubicGlass() {
    const materialRef = useRef<any>(null)
    const { cubicGlass } = useStore()
    const { viewport, size } = useThree()

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.time = clock.getElapsedTime() * cubicGlass.speed
            materialRef.current.gridSize = cubicGlass.gridSize
            materialRef.current.smoothness = cubicGlass.smoothness

            // Colors
            const colors = cubicGlass.colors
            if (colors[0]) materialRef.current.color1.set(colors[0])
            if (colors[1]) materialRef.current.color2.set(colors[1])
            if (colors[2]) materialRef.current.color3.set(colors[2])
            else materialRef.current.color3.set(colors[0])
            if (colors[3]) materialRef.current.color4.set(colors[3])
            else materialRef.current.color4.set(colors[0])
            if (colors[4]) materialRef.current.color5.set(colors[4])
            else materialRef.current.color5.set(colors[0])

            materialRef.current.resolution.set(size.width, size.height)
        }
    })

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <cubicGlassMaterial ref={materialRef} />
        </mesh>
    )
}
