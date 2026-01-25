const shaderMaterialHelper = `
  function shaderMaterial(uniforms, vertexShader, fragmentShader, onInit) {
    return class extends THREE.ShaderMaterial {
      constructor(parameters = {}) {
        const entries = Object.entries(uniforms)
        const uniformsMap = entries.reduce((acc, [name, value]) => {
          const uniform = { value }
          return { ...acc, [name]: uniform }
        }, {})
        super({
          uniforms: uniformsMap,
          vertexShader,
          fragmentShader,
          ...parameters,
        })
        entries.forEach(([name]) => {
            Object.defineProperty(this, name, {
                get: () => this.uniforms[name].value,
                set: (v) => { this.uniforms[name].value = v }
            })
        })
      }
    }
  }
`

export const generateMeshGradientCode = (config: any) => `
import * as React from "react"
import { Canvas, useFrame, extend, useThree } from "https://esm.sh/@react-three/fiber@8.15.16?external=react,react-dom&deps=three@0.160.0"
import * as THREE from "https://esm.sh/three@0.160.0"

${shaderMaterialHelper}

const GradientMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color('${config.color1}'),
    uColor2: new THREE.Color('${config.color2}'),
    uColor3: new THREE.Color('${config.color3}'),
    uColor4: new THREE.Color('${config.color4}'),
    uSpeed: ${config.speed},
    uNoiseDensity: ${config.noiseDensity},
    uNoiseStrength: ${config.noiseStrength},
    uKaleidoEnabled: ${config.kaleidoscope ? 1.0 : 0.0},
    uKaleidoSegments: ${config.kSegments || 6.0},
  },
  // Vertex
  \`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  \`,
  // Fragment
  \`
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    uniform float uSpeed;
    uniform float uNoiseDensity;
    uniform float uNoiseStrength;
    uniform float uKaleidoEnabled;
    uniform float uKaleidoSegments;
    varying vec2 vUv;

    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
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
      
      if (uKaleidoEnabled > 0.5) {
        uv = kaleidoscope(uv, uKaleidoSegments);
      }

      float time = uTime * uSpeed;
      float noise1 = snoise(uv * uNoiseDensity + time);
      float noise2 = snoise(uv * (uNoiseDensity * 0.5) - time * 0.5);
      uv += noise1 * uNoiseStrength;
      vec3 mix1 = mix(uColor1, uColor2, smoothstep(0.0, 1.0, uv.x + noise2 * 0.2));
      vec3 mix2 = mix(uColor3, uColor4, smoothstep(0.0, 1.0, uv.x - noise2 * 0.2));
      vec3 finalColor = mix(mix1, mix2, smoothstep(0.0, 1.0, uv.y + noise1 * 0.2));
      gl_FragColor = vec4(finalColor, 1.0);
    }
  \`
)

extend({ GradientMaterial })

function Scene() {
  const materialRef = React.useRef()
  const { viewport } = useThree()
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime()
    }
  })
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      {/* @ts-ignore */}
      <gradientMaterial ref={materialRef} />
    </mesh>
  )
}

export default function MeshGradient(props) {
  return (
    <div {...props} style={{ position: 'absolute', top: 0, left: 0, width: "100%", height: "100%", ...props.style }}>
        <Canvas>
            <Scene />
        </Canvas>
    </div>
  )
}
`

export const generateBlobStackCode = (config: any, p1: any, p2: any, p3: any) => `
import * as React from "react"
import { Canvas, useFrame, extend, useThree } from "https://esm.sh/@react-three/fiber@8.15.16?external=react,react-dom&deps=three@0.160.0"
import * as THREE from "https://esm.sh/three@0.160.0"

${shaderMaterialHelper}

const BlobStackMaterial = shaderMaterial(
  {
    uColor1: new THREE.Color('${config.Color1}'),
    uColor2: new THREE.Color('${config.Color2}'),
    uColor3: new THREE.Color('${config.Color3}'),
    uPos1: new THREE.Vector2(${p1.x}, ${p1.y}),
    uPos2: new THREE.Vector2(${p2.x}, ${p2.y}),
    uPos3: new THREE.Vector2(${p3.x}, ${p3.y}),
    uRadius1: ${config.Radius1},
    uRadius2: ${config.Radius2},
    uRadius3: ${config.Radius3},
    uFalloff1: ${config.Falloff1},
    uFalloff2: ${config.Falloff2},
    uFalloff3: 0.0,
    uAspect: 1.0,
    uNoiseInfo: ${config.Noise},
  },
  \`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  \`,
  \`
    uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
    uniform vec2 uPos1; uniform vec2 uPos2; uniform vec2 uPos3;
    uniform float uRadius1; uniform float uRadius2; uniform float uRadius3;
    uniform float uFalloff1; uniform float uFalloff2; uniform float uFalloff3;
    uniform float uAspect; uniform float uNoiseInfo;
    varying vec2 vUv;

    float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }

    void main() {
      vec2 aspectUV = vUv;
      aspectUV.x *= uAspect;
      vec2 p1 = uPos1; p1.x *= uAspect;
      vec2 p2 = uPos2; p2.x *= uAspect;
      vec2 p3 = uPos3; p3.x *= uAspect;

      float d1 = distance(aspectUV, p1);
      float d2 = distance(aspectUV, p2);
      float d3 = distance(aspectUV, p3);

      float w1 = smoothstep(uRadius1, uRadius1 * (1.0 - uFalloff1), d1);
      float w2 = smoothstep(uRadius2, uRadius2 * (1.0 - uFalloff2), d2);
      float w3 = smoothstep(uRadius3, uRadius3 * (1.0 - uFalloff3), d3);

      vec3 paint = uColor3;
      float a2 = smoothstep(uRadius2, uRadius2 * (1.0 - uFalloff2), d2);
      paint = mix(paint, uColor2, a2);
      float a1 = smoothstep(uRadius1, uRadius1 * (1.0 - uFalloff1), d1);
      paint = mix(paint, uColor1, a1);
      
      paint += random(vUv) * uNoiseInfo;
      gl_FragColor = vec4(paint, 1.0);
    }
  \`
)
extend({ BlobStackMaterial })

function Scene() {
  const materialRef = React.useRef()
  const { viewport } = useThree()
  useFrame(() => {
     if (materialRef.current) materialRef.current.uAspect = viewport.width / viewport.height
  })
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      {/* @ts-ignore */}
      <blobStackMaterial ref={materialRef} />
    </mesh>
  )
}

export default function BlobStack(props) {
  return (
    <div {...props} style={{ position: 'absolute', top: 0, left: 0, width: "100%", height: "100%", ...props.style }}>
        <Canvas>
            <Scene />
        </Canvas>
    </div>
  )
}
`
