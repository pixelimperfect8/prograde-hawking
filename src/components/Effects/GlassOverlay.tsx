import { useMemo, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'

import { useStore } from '../../store'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'

const noise2D = createNoise2D()

function applyRidgeProfile(
    signal: number, // expecting input roughly -1 to 1 or cyclic
    profile: 'Round' | 'Sharp' | 'Square' | 'Bezel' | 'Sawtooth' | 'Double'
): number {
    let normal = 0
    // Normalize input
    const t = signal % 1

    if (profile === 'Round') {
        normal = Math.cos(t * Math.PI * 2)
    }
    else if (profile === 'Sharp') {
        // Triangle wave
        normal = 2 * Math.abs(2 * (t - Math.floor(t + 0.5))) - 1
        normal *= -1
    }
    else if (profile === 'Square') {
        normal = Math.cos(t * Math.PI * 2) > 0 ? 0.8 : -0.8
    }
    else if (profile === 'Bezel') {
        const tri = Math.abs(t - 0.5) * 2
        normal = tri > 0.8 ? (tri - 0.8) * 5.0 : (tri < 0.2 ? (0.2 - tri) * 5.0 : 0.0)
        if (Math.cos(t * Math.PI * 2) < 0) normal *= -1
    }
    else if (profile === 'Sawtooth') {
        normal = (t - Math.floor(t)) * 2.0 - 1.0
    }
    else if (profile === 'Double') {
        normal = Math.cos(t * Math.PI * 4)
    }

    return normal
}

function generateFlutedNormalMap(
    density: number,
    waveFreq: number,
    waveAmp: number,
    patternType: 'Linear' | 'Kaleidoscope' | 'Chevrons' | 'Diagonal' | 'Hexagon' | 'Tiles',
    segments: number,
    ridgeProfile: 'Round' | 'Sharp' | 'Square' | 'Bezel' | 'Sawtooth' | 'Double',
    curvature: number,
    fluidity: number
) {
    const res = 1024
    const canvas = document.createElement('canvas')
    canvas.width = res
    canvas.height = res
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Fill with neutral normal
    ctx.fillStyle = 'rgb(128, 128, 255)'
    ctx.fillRect(0, 0, res, res)
    const imgData = ctx.getImageData(0, 0, res, res)
    const data = imgData.data

    const cx = res / 2
    const cy = res / 2

    // Pre-calculate noise scale for fluidity
    const noiseScale = 0.005 // Control how "large" the liquid ripples are

    // SSAA Loop (4 samples per pixel)
    for (let y = 0; y < res; y++) {
        for (let x = 0; x < res; x++) {
            let totalR = 0
            let totalG = 0

            const offsets = [0.25, 0.75]
            for (let dy of offsets) {
                for (let dx of offsets) {
                    let sampleX = x + dx
                    let sampleY = y + dy

                    // --- Domain Warping (Fluid Glass Effect) ---
                    if (fluidity > 0) {
                        // Use noise to displace the coordinate lookup
                        // We warp X by noise(x,y) and Y by noise(x+offset, y+offset)
                        // Fluidity controls the *strength* of this displacement
                        const warpStrength = fluidity * 50.0 // Max 50px displacement
                        const nX = noise2D(sampleX * noiseScale, sampleY * noiseScale)
                        const nY = noise2D(sampleX * noiseScale + 1000, sampleY * noiseScale + 1000)

                        sampleX += nX * warpStrength
                        sampleY += nY * warpStrength
                    }

                    let normalX = 0
                    let normalY = 0

                    if (patternType === 'Tiles') {
                        // Glass Tiles Logic: Multi-directional Tilt
                        const u = sampleX / res * density
                        const v = sampleY / res * density
                        const cellX = Math.floor(u)
                        const cellY = Math.floor(v)

                        // Random Seed per cell (Hash function)
                        const seed = Math.abs(Math.sin(cellX * 12.9898 + cellY * 78.233) * 43758.5453)
                        const rand = seed - Math.floor(seed)

                        // Random Tilt Angle (0 to 2PI)
                        const tiltDir = rand * Math.PI * 2

                        // Tilt Strength (Flat hard slope)
                        const tiltStrength = 1.0

                        // Calculate vector
                        normalX = Math.cos(tiltDir) * tiltStrength
                        normalY = Math.sin(tiltDir) * tiltStrength

                    } else {
                        // Standard 1D Patterns (Linear, Hex, etc) - calculated as Phase
                        let phase = 0

                        if (patternType === 'Kaleidoscope') {
                            const dxk = sampleX - cx
                            const dyk = sampleY - cy
                            const dist = Math.sqrt(dxk * dxk + dyk * dyk) / cx
                            const waveOffset = Math.sin(dist * Math.PI * 2 * waveFreq) * waveAmp
                            let angleRad = Math.atan2(dyk, dxk)
                            const effectiveAngle = angleRad + waveOffset
                            const sectorSize = (Math.PI * 2) / segments
                            phase = (Math.abs((effectiveAngle % sectorSize) - sectorSize / 2)) * density * 3.0
                        } else if (patternType === 'Chevrons') {
                            const u = sampleX / res * density
                            const v = sampleY / res * density
                            const uv = { x: u % 1, y: v % 1 }
                            const xSym = Math.abs(uv.x - 0.5)
                            const d = Math.abs(uv.y - xSym)
                            phase = d * 4.0
                        } else if (patternType === 'Diagonal') {
                            const u = sampleX / res
                            const v = sampleY / res
                            const rotU = (u + v) * density
                            phase = rotU
                        } else if (patternType === 'Hexagon') {
                            const u = sampleX / res * density
                            const v = sampleY / res * density
                            const r = { x: 1, y: 1.73 }
                            const h = { x: 0.5, y: 0.866 }
                            const a = { x: (u % r.x) - h.x, y: (v % r.y) - h.y }
                            const b = { x: ((u - h.x) % r.x) - h.x, y: ((v - h.y) % r.y) - h.y }
                            const lenA = Math.sqrt(a.x * a.x + a.y * a.y)
                            const lenB = Math.sqrt(b.x * b.x + b.y * b.y)
                            const dist = lenA < lenB ? lenA : lenB
                            phase = dist * 2.0
                        } else {
                            // Linear
                            const v = sampleY / res
                            const safeFreq = Math.round(waveFreq)
                            const waveOffset = Math.sin(v * Math.PI * 2 * safeFreq) * waveAmp
                            const bell = (1 - Math.cos(v * Math.PI * 2)) * 0.5
                            const curveOffset = bell * curvature
                            const xNorm = sampleX / res
                            phase = (xNorm + waveOffset + curveOffset) * density
                        }

                        // Apply Profile to get 1D scalar
                        const val = applyRidgeProfile(phase, ridgeProfile)
                        normalX = val
                        normalY = 0 // Flat in Y for standard patterns
                    }

                    // Accumulate (Map -1..1 to 0..1 for storage)
                    totalR += (normalX * 0.5 + 0.5)
                    totalG += (normalY * 0.5 + 0.5)
                }
            }

            const avgR = (totalR / 4) * 255
            const avgG = (totalG / 4) * 255

            const idx = (y * res + x) * 4
            data[idx] = avgR
            data[idx + 1] = avgG
            data[idx + 2] = 255
            data[idx + 3] = 255
        }
    }

    ctx.putImageData(imgData, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = 16
    texture.needsUpdate = true
    return texture
}

export default function GlassOverlay() {
    const { width, height } = useThree((state) => state.viewport)

    const { glass } = useStore()
    const config = glass

    const [debouncedConfig, setDebouncedConfig] = useState({
        rippleDensity: config.rippleDensity,
        waveFreq: config.waveFreq,
        waviness: config.waviness,
        patternType: config.patternType,
        segments: config.segments,
        ridgeProfile: config.ridgeProfile,
        curvature: config.curvature,
        fluidity: config.fluidity
    })

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedConfig({
                rippleDensity: config.rippleDensity,
                waveFreq: config.waveFreq,
                waviness: config.waviness,
                patternType: config.patternType,
                segments: config.segments,
                ridgeProfile: config.ridgeProfile,
                curvature: config.curvature,
                fluidity: config.fluidity
            })
        }, 200)

        return () => {
            clearTimeout(handler)
        }
    }, [
        config.rippleDensity,
        config.waveFreq,
        config.waviness,
        config.patternType,
        config.segments,
        config.ridgeProfile,
        config.curvature,
        config.fluidity
    ])

    const flutedNormalMap = useMemo(() => {
        const tex = generateFlutedNormalMap(
            debouncedConfig.rippleDensity,
            debouncedConfig.waveFreq,
            debouncedConfig.waviness,
            debouncedConfig.patternType as any,
            debouncedConfig.segments,
            debouncedConfig.ridgeProfile as any,
            debouncedConfig.curvature || 0,
            debouncedConfig.fluidity || 0
        )
        if (tex) {
            tex.center.set(0.5, 0.5)
        }
        return tex
    }, [
        debouncedConfig.rippleDensity,
        debouncedConfig.waveFreq,
        debouncedConfig.waviness,
        debouncedConfig.patternType,
        debouncedConfig.segments,
        debouncedConfig.ridgeProfile,
        debouncedConfig.curvature,
        debouncedConfig.fluidity
    ])

    useFrame((_state, delta) => {
        if (!flutedNormalMap) return

        flutedNormalMap.rotation = (config.patternRotation * Math.PI) / 180

        if (config.animate) {
            const rad = (config.flowDirection * Math.PI) / 180
            const moveX = Math.cos(rad) * config.flowSpeed * delta
            const moveY = Math.sin(rad) * config.flowSpeed * delta

            flutedNormalMap.offset.x += moveX
            flutedNormalMap.offset.y += moveY
        }
    })

    if (!config.enabled || !flutedNormalMap) return null

    return (
        <mesh position={[0, 0, 2]} renderOrder={10}>
            <planeGeometry args={[width, height]} />
            <MeshTransmissionMaterial
                {...config}
                background={new THREE.Color('#000000')}
                normalMap={flutedNormalMap}
                normalScale={new THREE.Vector2(config.fluteScale, config.fluteScale)}
                resolution={1024}
                ior={config.ior || 1.2}
            />
        </mesh>
    )
}
