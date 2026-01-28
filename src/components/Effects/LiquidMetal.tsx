import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
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

    // Inject Uniforms & Globals into <common>
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        uniform float uTime;
        uniform float uSpeed;
        uniform float uDistortion;
        
        ${noiseGLSL}
        
        // "Flowy Twisty" Logic using Domain Warping
        // We distort the coordinate space (p) with noise BEFORE sampling the height noise.
        // This creates swirling folds instead of lumps.
        float getHeight(vec3 p) {
            float t = uTime * uSpeed;
            
            // Large scale flow
            vec3 p1 = p * 0.8;
            
            // WARP 1: Distort 'p' with noise moving in one direction
            vec3 warp = vec3(
                snoise(vec3(p1.x, p1.y, t * 0.5)),
                snoise(vec3(p1.x + 10.0, p1.y + 10.0, t * 0.5)),
                0.0
            ) * 1.5; // Strong warp strength
            
            // Sample height using warped coordinates
            // We mix the original P slightly to keep some structure
            vec3 finalP = p1 + warp;
            
            float h = snoise(vec3(finalP.x, finalP.y, t * 0.2));
            
            // Add secondary detail layer
            float detail = snoise(vec3(p.x * 2.0 + warp.x, p.y * 2.0 + warp.y, t)) * 0.2;
            
            // Smooth sine folds
            float folds = sin(finalP.x * 2.0 + cos(finalP.y * 2.0 + t)) * 0.5;
            
            return (h + detail + folds) * uDistortion;
        }
        `
    )

    // Inject Normal Recalculation
    shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
        #include <beginnormal_vertex>
        
        vec3 p = position;
        float offset = 0.05; // Smooth normals
        
        float h0 = getHeight(p);
        float hx = getHeight(p + vec3(offset, 0.0, 0.0));
        float hy = getHeight(p + vec3(0.0, offset, 0.0));
        
        vec3 vX = vec3(offset, 0.0, hx - h0);
        vec3 vY = vec3(0.0, offset, hy - h0);
        
        objectNormal = normalize(cross(vX, vY));
        `
    )

    // Inject Position Displacement
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        float h = getHeight(position);
        transformed.z += h;
        `
    )
}

export default function LiquidMetal() {
    const meshRef = useRef<THREE.Mesh>(null)
    const { liquidMetal } = useStore()
    const { viewport } = useThree()

    // Keep reference to shader to update uniforms
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
            <Environment preset="city" />

            <mesh ref={meshRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
                <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5, 300, 300]} />
                <meshStandardMaterial
                    color={liquidMetal.color}
                    metalness={liquidMetal.metalness}
                    roughness={liquidMetal.roughness}
                    onBeforeCompile={(shader) => {
                        patchShader(shader)
                        shaderRef.current = shader
                    }}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Backup Lights */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={2.0} color="#ffffff" />
            <pointLight position={[-10, 0, 5]} intensity={2.0} color="#ff0000" />
            <pointLight position={[10, 0, 5]} intensity={2.0} color="#0000ff" />
        </group>
    )
}
