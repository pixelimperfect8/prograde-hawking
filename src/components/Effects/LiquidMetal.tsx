import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

function patchShader(shader: any) {
    shader.uniforms.uTime = { value: 0 }
    shader.uniforms.uSpeed = { value: 0.2 }
    shader.uniforms.uDistortion = { value: 1.0 }

    // Simplex Noise 3D
    const noiseGLSL = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }
    `

    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        uniform float uTime;
        uniform float uSpeed;
        uniform float uDistortion;
        
        ${noiseGLSL}
        
        float getHeight(vec3 p) {
            float t = uTime * uSpeed * 0.5;
            
            vec3 pStretch = vec3(p.x * 0.15, p.y * 0.6, 0.0);
            
            float giant = sin(pStretch.x + t) * sin(pStretch.y + t * 0.5) * 2.0;
            float swell = snoise(vec3(p.x * 0.2, p.y * 0.2, t)) * 1.5;
            
            return (giant + swell) * uDistortion;
        }
        `
    )

    shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
        #include <beginnormal_vertex>
        
        vec3 p = position;
        float offset = 0.2; 
        
        float h0 = getHeight(p);
        float hx = getHeight(p + vec3(offset, 0.0, 0.0));
        float hy = getHeight(p + vec3(0.0, offset, 0.0));
        
        vec3 vX = vec3(offset, 0.0, hx - h0);
        vec3 vY = vec3(0.0, offset, hy - h0);
        
        objectNormal = normalize(cross(vX, vY));
        `
    )

    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float h = getHeight(position);
        transformed.z += h;
        `
    )
}

function MovingShapes() {
    return (
        <group position={[0, -5, -15]} rotation={[-0.2, 0, 0]}>
            {/* Background Gradient Plane (Deep Dark) */}
            <mesh position={[0, 0, -5]}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* Blue Blob (Top Right) */}
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.0}>
                <mesh position={[10, 10, -2]} scale={[15, 15, 1]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial color="#0081f7" />
                </mesh>
            </Float>

            {/* Pink Blob (Center Left) */}
            <Float speed={2.0} rotationIntensity={0.5} floatIntensity={1.5}>
                <mesh position={[-5, 0, 0]} scale={[12, 12, 1]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial color="#ff75ca" />
                </mesh>
            </Float>

            {/* Gold Blob (Bottom Right) */}
            <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.2}>
                <mesh position={[8, -10, 2]} scale={[10, 10, 1]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial color="#ffae87" />
                </mesh>
            </Float>

            {/* Extra Cyan Blob (Top Left) */}
            <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.0}>
                <mesh position={[-15, 12, -2]} scale={[8, 8, 1]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>
            </Float>
        </group>
    )
}

export default function LiquidMetal() {
    const meshRef = useRef<THREE.Mesh>(null)
    const { liquidMetal } = useStore()
    const shaderRef = useRef<any>(null)

    useFrame(({ clock }) => {
        if (shaderRef.current) {
            shaderRef.current.uniforms.uTime.value = clock.getElapsedTime()
            shaderRef.current.uniforms.uSpeed.value = liquidMetal.speed
            shaderRef.current.uniforms.uDistortion.value = liquidMetal.distortion
        }
    })

    return (
        <group>
            {/* 1. The Colorful Background (What we see THROUGH the liquid) */}
            <MovingShapes />

            {/* 2. Standard Environment for Surface Reflections (Optional, mixing with refraction) */}
            <Environment preset="city" blur={1} />

            {/* 3. The Liquid Mesh (Refractive Glass) */}
            <mesh
                ref={meshRef}
                position={[0, -2, -6]}
                rotation={[-Math.PI / 2.5, 0, 0]}
            >
                <planeGeometry args={[40, 40, 400, 400]} />
                {/* 
                   MeshPhysicalMaterial is KEY here.
                   Transmission = 1 (Glass)
                   Roughness = Low
                   Thickness = High (For refraction depth)
                */}
                <meshPhysicalMaterial
                    color="#ffffff" // Glass should be white/clear base
                    transmission={1.0}
                    thickness={3.0}
                    roughness={liquidMetal.roughness * 0.3} // Very smooth default
                    ior={1.4}
                    // Map "Metalness" slider to Chromatic Aberration for fun visual flair
                    // chromaticAberration={liquidMetal.metalness * 0.5}

                    onBeforeCompile={(shader) => {
                        patchShader(shader)
                        shaderRef.current = shader
                    }}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    )
}
