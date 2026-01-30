import { useRef } from 'react'
import { useStore } from '../../store'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

const OverlayMaterial = shaderMaterial(
    {
        uColor: new THREE.Color('#ffffff'),
        uOpacity: 1.0,
        uScale: 20.0,
        uThickness: 0.05,
        uTime: 0,
        uSpeed: 0.5,
        uType: 0, // 0:Grid, 1:Dot, 2:Cross, 3:Hex, 4:Tech, 5: Dots (Only), 6: Architectural, 7: Outlined Dots
        uAspect: 1.0,
        uMouse: new THREE.Vector2(0, 0),
        uSpotlight: 0.0 // 0 or 1
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
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uScale;
    uniform float uThickness;
    uniform float uTime;
    uniform float uSpeed;
    uniform int uType;
    uniform float uAspect;
    uniform vec2 uMouse;
    uniform float uSpotlight;

    varying vec2 vUv;

    // --- UTILS ---
    float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

    void main() {
        vec2 uv = vUv;
        vec2 p = uv;
        p.x *= uAspect; // Absolute aspect for patterns
        
        float alpha = 0.0;
        
        // 0: GRID (Classic)
        if (uType == 0) {
            vec2 g = fract(p * uScale);
            float thickness = uThickness * 0.5;
            vec2 gridUV = fract(p * uScale) - 0.5;
            float d = min(abs(gridUV.x), abs(gridUV.y));
            alpha = 1.0 - smoothstep(thickness, thickness + 0.02, d);
        }
        
        // 1: GRID + DOT
        else if (uType == 1) {
            vec2 gridUV = fract(p * uScale) - 0.5;
            float d = min(abs(gridUV.x), abs(gridUV.y));
            float thickness = uThickness * 0.3;
            float gridAlpha = 1.0 - smoothstep(thickness, thickness + 0.02, d);
            float dot = 1.0 - smoothstep(uThickness * 2.0, uThickness * 2.0 + 0.05, length(gridUV));
            alpha = max(gridAlpha * 0.5, dot);
        }
        
        // 2: CROSS
        else if (uType == 2) {
            vec2 cell = fract(p * uScale) - 0.5;
            float size = 0.2; 
            float thickness = uThickness * 0.5;
            float h = step(abs(cell.x), size) * step(abs(cell.y), thickness);
            float v = step(abs(cell.y), size) * step(abs(cell.x), thickness);
            alpha = max(h, v);
        }
        
        // 3: HEXAGON
        else if (uType == 3) {
           vec2 gridUV = fract(p * uScale) - 0.5;
            float d1 = abs(gridUV.x);
            float s = 0.866; float c = 0.5;
            vec2 p60 = mat2(c, -s, s, c) * gridUV;
            float d2 = abs(p60.x);
            vec2 p120 = mat2(c, s, -s, c) * gridUV;
            float d3 = abs(p120.x);
            float d = min(d1, min(d2, d3));
            alpha = 1.0 - smoothstep(uThickness * 0.5, uThickness * 0.5 + 0.02, d);
        }
        
        // 4: TECH LINES
        else if (uType == 4) {
            float t = uTime * uSpeed * 0.2;
            vec2 diag = p * uScale;
            float mixVal = diag.x + diag.y - t * 5.0; 
            float line = fract(mixVal);
            float d = abs(line - 0.5);
            float lines = 1.0 - smoothstep(uThickness, uThickness + 0.1, d);
            vec2 id = floor(p * uScale * 0.5);
            float rnd = hash(id + floor(t)); 
            float detail = step(0.8, fract(mixVal * 5.0)) * 0.5;
            alpha = lines * step(0.3, rnd) + detail * step(0.9, rnd);
        }

        // 5: DOTS (Simple Solid)
        else if (uType == 5) {
             vec2 gridUV = fract(p * uScale) - 0.5;
             float dist = length(gridUV);
             // Size based on thickness, but capped
             float size = uThickness * 1.5; 
             alpha = 1.0 - smoothstep(size, size + 0.05, dist);
        }

        // 6: ARCHITECTURAL (Clean Grid)
        else if (uType == 6) {
             // Very fine, non-intrusive lines
             vec2 gridUV = fract(p * uScale) - 0.5;
             float d = min(abs(gridUV.x), abs(gridUV.y));
             // Use sqrt for sharper falloff on very thin lines
             float thickness = uThickness * 0.2; 
             alpha = 1.0 - smoothstep(thickness, thickness + 0.01, d);
             
             // Major lines every 5 cells
             vec2 majorGrid = fract(p * uScale / 5.0) - 0.5;
             float dMajor = min(abs(majorGrid.x), abs(majorGrid.y));
             float majorAlpha = 1.0 - smoothstep(thickness * 2.0, thickness * 2.0 + 0.01, dMajor);
             
             alpha = max(alpha * 0.5, majorAlpha);
        }

        // 7: OUTLINED DOTS
        else if (uType == 7) {
             vec2 gridUV = fract(p * uScale) - 0.5;
             float dist = length(gridUV);
             float size = uThickness * 1.5;
             float ringWidth = 0.05;
             float outer = 1.0 - smoothstep(size, size + 0.02, dist);
             float inner = 1.0 - smoothstep(size - ringWidth - (uThickness*0.5), size - ringWidth - (uThickness*0.5) + 0.02, dist);
             alpha = outer - inner;
        }

        // 8: CHEVRONS
        else if (uType == 8) {
            // V-Shape
            vec2 cUV = fract(p * uScale);
            // Symmetry on X
            float x = abs(cUV.x - 0.5);
            // Diagonal line: y = x
            float d = abs(cUV.y - x);
            alpha = 1.0 - smoothstep(uThickness * 0.5, uThickness * 0.5 + 0.05, d);
        }

        // 9: DIAGONAL GRID
        else if (uType == 9) {
            // Rotate 45 deg
            float s = 0.707; float c = 0.707;
            vec2 rotP = mat2(c, -s, s, c) * p;
            
            vec2 gridUV = fract(rotP * uScale) - 0.5;
            float d = min(abs(gridUV.x), abs(gridUV.y));
            alpha = 1.0 - smoothstep(uThickness * 0.5, uThickness * 0.5 + 0.02, d);
        }

        // 10: HEX DOTS
        else if (uType == 10) {
            // Hex grid logic for centers
            vec2 r = vec2(1.0, 1.73);
            vec2 h = r * 0.5;
            vec2 uv = p * uScale;
            vec2 a = mod(uv, r) - h;
            vec2 b = mod(uv - h, r) - h;
            
            vec2 gv = dot(a, a) < dot(b, b) ? a : b;
            
            float dist = length(gv);
            float size = uThickness * 2.0;
            alpha = 1.0 - smoothstep(size, size + 0.05, dist);
        }

        // SPOTLIGHT LOGIC
        if (uSpotlight > 0.5) {
             // Distance from mouse (normalized 0-1 UV space approx)
             // Mouse is passed as 0-1 UV coordinate
             float dist = distance(vUv, uMouse);
             // Spotlight radius
             float radius = 0.3;
             float spot = 1.0 - smoothstep(0.1, radius, dist);
             alpha *= spot;
        }

        gl_FragColor = vec4(uColor, alpha * uOpacity);
    }
    `
)

extend({ OverlayMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            overlayMaterial: any
        }
    }
}

export default function PatternOverlay() {
    const materialRef = useRef<any>(null)
    const { overlay } = useStore()
    const { viewport, mouse } = useThree()

    // Map type string to int
    const typeMap: Record<string, number> = {
        'Grid': 0,
        'Grid + Dot': 1,
        'Cross': 2,
        'Hexagon': 3,
        'Tech': 4,
        'Dots': 5,
        'Architectural': 6,
        'Outlined Dots': 7,
        'Chevrons': 8,
        'Diagonal Grid': 9,
        'Hex Dots': 10
    }

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uTime = clock.getElapsedTime()
            materialRef.current.uColor = new THREE.Color(overlay.color)
            materialRef.current.uOpacity = overlay.opacity
            materialRef.current.uScale = overlay.scale
            materialRef.current.uThickness = overlay.thickness
            materialRef.current.uSpeed = overlay.speed
            materialRef.current.uType = typeMap[overlay.type] ?? 0
            materialRef.current.uAspect = viewport.width / viewport.height

            // Mouse is -1 to 1. Convert to 0 to 1 for UV
            materialRef.current.uMouse = new THREE.Vector2(
                (mouse.x + 1) / 2,
                (mouse.y + 1) / 2
            )
            materialRef.current.uSpotlight = overlay.spotlight ? 1.0 : 0.0
        }
    })

    if (!overlay.enabled) return null

    return (
        <mesh scale={[viewport.width, viewport.height, 1]} position={[0, 0, 0.05]}>
            {/* Z position 0.05 to sit above background but behind Glass (usually at 0.1 or 1) */}
            <planeGeometry args={[1, 1]} />
            {/* @ts-ignore */}
            <overlayMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.NormalBlending}
            />
        </mesh>
    )
}
