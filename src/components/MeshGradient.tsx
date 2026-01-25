import { useRef } from 'react'
import { useFrame, extend, useThree } from '@react-three/fiber'
import { Color } from 'three'
import { shaderMaterial } from '@react-three/drei'

import { useStore } from '../store'

// Simplex 4D Noise for seamless loops
const GradientMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new Color('#ff0000'),
    uColor2: new Color('#00ff00'),
    uColor3: new Color('#0000ff'),
    uColor4: new Color('#ffff00'),
    uSpeed: 0.2,
    uNoiseDensity: 2.0,
    uNoiseStrength: 0.2,
    uKaleidoEnabled: 0.0,
    uKaleidoSegments: 6.0,
    uLoop: 0.0, // 0 = Infinite, 1 = Loop
    uLoopDuration: 10.0 // Seconds
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
    uniform float uLoop;
    uniform float uLoopDuration;
    
    varying vec2 vUv;

    // Simplex 4D Noise Function (Standard Implementation)
    // Permission-free open source noise
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

    vec4 grad4(float j, vec4 ip){
        const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
        vec4 p,s;

        p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
        p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
        s = vec4(lessThan(p, vec4(0.0)));
        p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

        return p;
    }

    float snoise(vec4 v){
        const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                            0.309016994374947451); // (sqrt(5) - 1)/4   F4
        // First corner
        vec4 i  = floor(v + dot(v, vec4(C.y)) );
        vec4 x0 = v -   i + dot(i, vec4(C.x)) ;

        // Other corners
        vec4 i0;

        vec3 isX = step( x0.yzw, x0.xxx );
        vec3 isYZ = step( x0.zww, x0.yyz );
        //  i0.x = dot( isX, vec3( 1.0 ) );
        i0.x = isX.x + isX.y + isX.z;
        i0.yzw = 1.0 - isX;

        //  i0.y += dot( isYZ.xy, vec3( 1.0 ) );
        i0.y += isYZ.x + isYZ.y;
        i0.zw += 1.0 - isYZ.xy;

        i0.z += isYZ.z;
        i0.w += 1.0 - isYZ.z;

        // i0 now has the correct values.
        vec4 i3 = clamp( i0, 0.0, 1.0 );
        vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
        vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

        //  x0 = x0 - 0.0 + 0.0 * C 
        vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
        vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
        vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
        vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

        // Permutations
        i = mod(i, 289.0); 
        float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
        vec4 j1 = permute( permute( permute( permute (
                    i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
                + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
                + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
                + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
        // Gradients
        // ( N*N*N*N ) = ( 7*7*7*7 ) = 2401 = 0 bits = 0
        // ( 7*7*7 ) = 343 = 3 bits = 8
        // ( 7*7 ) = 49 = 6 bits = 64
        // ( 7 ) = 7 = 9 bits = 512

        vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

        vec4 p0 = grad4(j0,   ip);
        vec4 p1 = grad4(j1.x, ip);
        vec4 p2 = grad4(j1.y, ip);
        vec4 p3 = grad4(j1.z, ip);
        vec4 p4 = grad4(j1.w, ip);

        // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        p4 *= taylorInvSqrt(dot(p4,p4));

        // Mix contributions from the five corners
        vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
        vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);
        m0 = m0 * m0;
        m1 = m1 * m1;
        return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
                    + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

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
      float noise1 = 0.0;
      float noise2 = 0.0;

      if (uLoop > 0.5) {
        // Seamless Loop Logic: 4D Noise sampled on a circle
        // angle = time / duration * 2PI
        float angle = (uTime / uLoopDuration) * 3.14159 * 2.0;
        vec2 circleOffset = vec2(cos(angle), sin(angle)) * 2.0; // Radius 2
        
        // Sample 4D noise: x, y, circleX, circleY
        noise1 = snoise(vec4(uv * uNoiseDensity, circleOffset));
        noise2 = snoise(vec4(uv * (uNoiseDensity * 0.5), circleOffset * 0.5)); // Diff radius
        
      } else {
        // Infinite Linear Logic: 3D Mapping to 4D
        noise1 = snoise(vec4(uv * uNoiseDensity, time, 0.0));
        noise2 = snoise(vec4(uv * (uNoiseDensity * 0.5), time * 0.5, 10.0));
      }
      
      // Distort UVs slightly
      uv += noise1 * uNoiseStrength;
      
      // Mix colors based on position and noise
      vec3 mix1 = mix(uColor1, uColor2, smoothstep(0.0, 1.0, uv.x + noise2 * 0.2));
      vec3 mix2 = mix(uColor3, uColor4, smoothstep(0.0, 1.0, uv.x - noise2 * 0.2));
      
      vec3 finalColor = mix(mix1, mix2, smoothstep(0.0, 1.0, uv.y + noise1 * 0.2));
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
)

extend({ GradientMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      gradientMaterial: any
    }
  }
}

export default function MeshGradient() {
  const materialRef = useRef<any>(null)
  const { gradient } = useStore()
  const { viewport } = useThree()
  const scaleX = viewport.width * 2.0
  const scaleY = viewport.height * 2.0

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime()
    }
  })

  return (
    <mesh scale={[scaleX, scaleY, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />
      {/* @ts-ignore */}
      <gradientMaterial
        ref={materialRef}
        uColor1={new Color(gradient.color1)}
        uColor2={new Color(gradient.color2)}
        uColor3={new Color(gradient.color3)}
        uColor4={new Color(gradient.color4)}
        uSpeed={gradient.speed}
        uNoiseDensity={gradient.noiseDensity}
        uNoiseStrength={gradient.noiseStrength}
        uKaleidoEnabled={gradient.kaleidoscope ? 1.0 : 0.0}
        uKaleidoSegments={gradient.kSegments}
        uLoop={gradient.loop ? 1.0 : 0.0}
        uLoopDuration={10.0}
        wireframe={gradient.wireframe}
      />
    </mesh>
  )
}
