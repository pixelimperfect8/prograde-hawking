import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store'

const SHADER_UTILS = `
// Simplex Noise (Ashima / Stefan Gustavson)
// More robust implementation than the previous one
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) { 
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Blend Function (Soft Light / Normal mix for smoother blending)
vec3 blendNormal(vec3 base, vec3 blend) { return blend; }
vec3 blendNormal(vec3 base, vec3 blend, float opacity) { return (blendNormal(base, blend) * opacity + base * (1.0 - opacity)); }
`

const vertexShader = `
${SHADER_UTILS}

varying vec3 v_color;

uniform float u_time;
uniform vec2 resolution;
uniform vec3 u_baseColor;
uniform float u_worldScale;

// Flattened Wave Layers
uniform vec3 u_waveLayers_colors[3];
uniform vec2 u_waveLayers_noiseFreqs[3];
uniform float u_waveLayers_noiseSpeeds[3];
uniform float u_waveLayers_noiseFlows[3];
uniform float u_waveLayers_noiseSeeds[3];
uniform float u_waveLayers_noiseFloors[3];
uniform float u_waveLayers_noiseCeils[3];

// Global
uniform vec2 u_global_noiseFreq;
uniform float u_global_noiseSpeed;

// VertDeform
uniform float u_vertDeform_incline;
uniform float u_vertDeform_offsetTop;
uniform float u_vertDeform_offsetBottom;
uniform vec2 u_vertDeform_noiseFreq;
uniform float u_vertDeform_noiseAmp;
uniform float u_vertDeform_noiseSpeed;
uniform float u_vertDeform_noiseFlow;
uniform float u_vertDeform_noiseSeed;

void main() {
  vec3 pos = position;
  vec2 uvNormRange = uv * 2.0 - 1.0; 

  // Offset by constant large value to avoid zero-crossing artifacts at origin
  float time = u_time * u_global_noiseSpeed;
  vec2 noiseCoord = (resolution * uvNormRange * u_global_noiseFreq) + vec2(1234.5, 6789.0);
  
  float tilt = resolution.y / 2.0 * uvNormRange.y;
  float incline = resolution.x * uvNormRange.x / 2.0 * u_vertDeform_incline;
  float offset = resolution.x / 2.0 * u_vertDeform_incline * mix(u_vertDeform_offsetBottom, u_vertDeform_offsetTop, uv.y);
  
  float noise = snoise(vec3(
    noiseCoord.x * u_vertDeform_noiseFreq.x + time * u_vertDeform_noiseFlow,
    noiseCoord.y * u_vertDeform_noiseFreq.y,
    time * u_vertDeform_noiseSpeed + u_vertDeform_noiseSeed
  )) * u_vertDeform_noiseAmp;
  
  // Apply Window Function (Smooth parabolic falloff)
  noise *= 1.0 - pow(abs(uvNormRange.y), 2.0);
  
  // Soft Clamp instead of Hard Max to avoid abrupt gradient changes (The "Solid" line glitch)
  // noise = max(0.0, noise); --> Replaced with SoftMax if needed, but snoise is -1..1
  // Actually, let's keep max(0.0) but ensure normals are recomputed or shading is flat.
  // Since this is unlit (Fragment shader just outputs color), hard edges in geometry mean hard edges in color interpolation.
  noise = max(0.0, noise);
  
  // Combine displacements (still in 'Pixel' units)
  float pixelY = tilt + incline + noise - offset;
  
  // Apply to World Position
  pos.y += pixelY * u_worldScale; 

  // Color Mixing
  v_color = u_baseColor;
  for (int i = 0; i < 3; i++) {
      float noiseVal = smoothstep(
        u_waveLayers_noiseFloors[i],
        u_waveLayers_noiseCeils[i],
        snoise(vec3(
          noiseCoord.x * u_waveLayers_noiseFreqs[i].x + time * u_waveLayers_noiseFlows[i],
          noiseCoord.y * u_waveLayers_noiseFreqs[i].y,
          time * u_waveLayers_noiseSpeeds[i] + u_waveLayers_noiseSeeds[i]
        )) / 2.0 + 0.5
      );
      v_color = blendNormal(v_color, u_waveLayers_colors[i], pow(noiseVal, 4.0));
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const fragmentShader = `
varying vec3 v_color;
void main() {
  gl_FragColor = vec4(v_color, 1.0);
}
`

export default function FlowGradient() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()

  // Reference Configuration
  const seed = 5;
  const freqX = 14e-5;
  const freqY = 29e-5;
  const amp = 320;

  useFrame((state) => {
    if (materialRef.current) {
      // READ FRESH STATE to fix "Controls don't work"
      const currentFlow = useStore.getState().flowGradient;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Time in MS
      materialRef.current.uniforms.u_time.value = state.clock.getElapsedTime() * 1000

      materialRef.current.uniforms.resolution.value.set(width, height)

      // Speed Control
      // Default baseline speed is ~1.0, we multiply by the global speed slider
      // The vertex shader u_global_noiseSpeed already handles time scaling, 
      // but we need to ensure "time" passed is scaled OR we scale the speed uniform.
      // Better: Scale the time uniform itself by the speed multiplier? 
      // Actually vertex shader does: float time = u_time * u_global_noiseSpeed;
      // We can just modulate u_global_noiseSpeed or pass a new multiplier.
      // For simplicity let's just scale u_time if we want global slowdown, OR update u_global_noiseSpeed.
      // Let's update u_global_noiseSpeed to include the user's slider value.
      const baseSpeed = 5e-6; // Original value
      materialRef.current.uniforms.u_global_noiseSpeed.value = baseSpeed * (currentFlow.speed * 2.5); // Multiply by slider

      // Calculate World Scale: 1 Pixel = X World Units
      // Multiplied by 0.3 for gentle wave height
      materialRef.current.uniforms.u_worldScale.value = (viewport.height / height) * 0.3;

      // Update Colors Validated
      materialRef.current.uniforms.u_baseColor.value.set(currentFlow.color1)
      materialRef.current.uniforms.u_waveLayers_colors.value[0].set(currentFlow.color2)
      materialRef.current.uniforms.u_waveLayers_colors.value[1].set(currentFlow.color3)
      materialRef.current.uniforms.u_waveLayers_colors.value[2].set(currentFlow.color4)
    }
  })

  // Initial Uniforms from Store State
  const initialFlow = useStore.getState().flowGradient;

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    resolution: { value: new THREE.Vector2(1, 1) },
    u_worldScale: { value: 0.001 },

    u_baseColor: { value: new THREE.Color(initialFlow.color1) },

    // Arrays for Wave Layers
    u_waveLayers_colors: { value: [new THREE.Color(initialFlow.color2), new THREE.Color(initialFlow.color3), new THREE.Color(initialFlow.color4)] },
    u_waveLayers_noiseFreqs: { value: [new THREE.Vector2(2.25, 3.25), new THREE.Vector2(2.5, 3.5), new THREE.Vector2(2.75, 3.75)] },
    u_waveLayers_noiseSpeeds: { value: [11.3, 11.6, 11.9] },
    u_waveLayers_noiseFlows: { value: [6.8, 7.1, 7.4] },
    u_waveLayers_noiseSeeds: { value: [seed + 10, seed + 20, seed + 30] },
    u_waveLayers_noiseFloors: { value: [0.1, 0.1, 0.1] },
    u_waveLayers_noiseCeils: { value: [0.70, 0.77, 0.84] },

    // Global
    u_global_noiseFreq: { value: new THREE.Vector2(freqX, freqY) },
    u_global_noiseSpeed: { value: 5e-6 },

    // VertDeform
    u_vertDeform_incline: { value: Math.sin(0) / Math.cos(0) }, // 0 angle
    u_vertDeform_offsetTop: { value: -0.5 },
    u_vertDeform_offsetBottom: { value: -0.5 },
    u_vertDeform_noiseFreq: { value: new THREE.Vector2(3, 4) },

    u_vertDeform_noiseAmp: { value: amp },

    u_vertDeform_noiseSpeed: { value: 10 },
    u_vertDeform_noiseFlow: { value: 3 },
    u_vertDeform_noiseSeed: { value: seed },

  }), [])

  return (
    // Scale X by 1.2 to fix "narrow/gap" issue due to perspective
    <mesh position={[0, 0, -2]} scale={[viewport.width * 1.2, viewport.height, 1]}>
      {/* Ultra High Density 1024x256 to minimize linear interpolation artifacts */}
      <planeGeometry args={[1, 1, 1024, 256]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false} // CRITICAL: Fix for "Solid Glitch" (Z-Fighting or Self-Intersection)
        depthWrite={false}
        toneMapped={false} // Disable Tone Mapping to allow colors > 1.0 (Bloom Support)
      />
    </mesh>
  )
}
