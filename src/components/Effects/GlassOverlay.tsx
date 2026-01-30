import { useMemo, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'

import { useStore } from '../../store'
import * as THREE from 'three'

function applyRidgeProfile(
    signal: number, // expecting input roughly -1 to 1 or cyclic
    profile: 'Round' | 'Sharp' | 'Square' | 'Bezel' | 'Sawtooth' | 'Double'
): number {
    let normal = 0
    // Normalize input to 0-1 cycle for some profiles
    // But most patterns output cosine (-1 to 1)

    // Map cosine (-1 to 1) to angle (0 to 2PI) approximation if needed
    // Or just treat signal as the "height" directly.

    // NOTE: The previous logic used 'angle' (Linear) or 'finalAngleSignal' (Kaleidoscope).
    // Let's standardise: signal is an Angle (radians) or a normalized phase (0-1).
    // Let's assume SIGNAL is raw phase (0 to 1).

    const t = signal % 1

    if (profile === 'Round') {
        normal = Math.cos(t * Math.PI * 2)
    }
    else if (profile === 'Sharp') {
        // Triangle wave
        normal = 2 * Math.abs(2 * (t - Math.floor(t + 0.5))) - 1
        // Invert to match previous look if needed
        normal *= -1
    }
    else if (profile === 'Square') {
        normal = Math.cos(t * Math.PI * 2) > 0 ? 0.8 : -0.8
    }
    else if (profile === 'Bezel') {
        // Flat top, sharp sides
        // Triangle 0-1
        const tri = Math.abs(t - 0.5) * 2
        // Thresholds
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
    patternType: 'Linear' | 'Kaleidoscope' | 'Chevrons' | 'Diagonal' | 'Hexagon',
    segments: number,
    ridgeProfile: 'Round' | 'Sharp' | 'Square' | 'Bezel' | 'Sawtooth' | 'Double',
    curvature: number
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

    // SSAA Loop (4 samples per pixel)
    for (let y = 0; y < res; y++) {
        for (let x = 0; x < res; x++) {
            let totalR = 0

            const offsets = [0.25, 0.75]
            for (let dy of offsets) {
                for (let dx of offsets) {
                    const sampleX = x + dx
                    const sampleY = y + dy

                    let phase = 0 // 0 to 1

                    if (patternType === 'Kaleidoscope') {
                        const dxk = sampleX - cx
                        const dyk = sampleY - cy
                        const dist = Math.sqrt(dxk * dxk + dyk * dyk) / cx

                        const waveOffset = Math.sin(dist * Math.PI * 2 * waveFreq) * waveAmp
                        let angleRad = Math.atan2(dyk, dxk)

                        const effectiveAngle = angleRad + waveOffset
                        const sectorSize = (Math.PI * 2) / segments

                        // Normalized phase within sector
                        phase = (Math.abs((effectiveAngle % sectorSize) - sectorSize / 2)) * density * 3.0 // scale adjust

                    } else if (patternType === 'Chevrons') {
                        const u = sampleX / res * density
                        const v = sampleY / res * density
                        const uv = { x: u % 1, y: v % 1 }
                        const xSym = Math.abs(uv.x - 0.5)
                        const d = Math.abs(uv.y - xSym)
                        phase = d * 4.0 // Scale up frequency

                    } else if (patternType === 'Diagonal') {
                        const u = sampleX / res
                        const v = sampleY / res
                        const rotU = (u + v) * density
                        phase = rotU

                    } else if (patternType === 'Hexagon') {
                        const u = sampleX / res * density
                        const v = sampleY / res * density
                        // Hex Math
                        const r = { x: 1, y: 1.73 }
                        const h = { x: 0.5, y: 0.866 }
                        const a = { x: (u % r.x) - h.x, y: (v % r.y) - h.y }
                        const b = { x: ((u - h.x) % r.x) - h.x, y: ((v - h.y) % r.y) - h.y }
                        const lenA = Math.sqrt(a.x * a.x + a.y * a.y)
                        const lenB = Math.sqrt(b.x * b.x + b.y * b.y)
                        const dist = lenA < lenB ? lenA : lenB
                        phase = dist * 2.0

                    } else { // Linear
                        const v = sampleY / res
                        const safeFreq = Math.round(waveFreq)
                        const waveOffset = Math.sin(v * Math.PI * 2 * safeFreq) * waveAmp
                        const bell = (1 - Math.cos(v * Math.PI * 2)) * 0.5
                        const curveOffset = bell * curvature
                        const xNorm = sampleX / res
                        phase = (xNorm + waveOffset + curveOffset) * density
                    }

                    const normal = applyRidgeProfile(phase, ridgeProfile)
                    totalR += (normal * 0.5 + 0.5)
                }
            }

            const avgR = (totalR / 4) * 255
            const idx = (y * res + x) * 4
            data[idx] = avgR
            data[idx + 1] = 128
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
        curvature: config.curvature
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
                curvature: config.curvature
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
        config.curvature
    ])

    const flutedNormalMap = useMemo(() => {
        const tex = generateFlutedNormalMap(
            debouncedConfig.rippleDensity,
            debouncedConfig.waveFreq,
            debouncedConfig.waviness,
            debouncedConfig.patternType as 'Linear' | 'Kaleidoscope' | 'Chevrons' | 'Diagonal' | 'Hexagon',
            debouncedConfig.segments,
            debouncedConfig.ridgeProfile as 'Round' | 'Sharp' | 'Square' | 'Bezel' | 'Sawtooth' | 'Double',
            debouncedConfig.curvature || 0
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
        debouncedConfig.curvature
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
            />
        </mesh>
    )
}
