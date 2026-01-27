import { useMemo, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'

import { useStore } from '../../store'
import * as THREE from 'three'

function generateFlutedNormalMap(
    density: number,
    waveFreq: number,
    waveAmp: number,
    patternType: 'Linear' | 'Kaleidoscope',
    segments: number,
    ridgeProfile: 'Round' | 'Sharp' | 'Square',
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

            // 4 samples: (0.25, 0.25), (0.75, 0.25), (0.25, 0.75), (0.75, 0.75)
            const offsets = [0.25, 0.75]
            for (let dy of offsets) {
                for (let dx of offsets) {
                    const sampleX = x + dx
                    const sampleY = y + dy

                    let angle = 0

                    if (patternType === 'Kaleidoscope') {
                        const dxk = sampleX - cx
                        const dyk = sampleY - cy
                        const dist = Math.sqrt(dxk * dxk + dyk * dyk) / cx

                        const waveOffset = Math.sin(dist * Math.PI * 2 * waveFreq) * waveAmp
                        let angleRad = Math.atan2(dyk, dxk)

                        const effectiveAngle = angleRad + waveOffset
                        const sectorSize = (Math.PI * 2) / segments

                        const finalAngleSignal = (Math.abs((effectiveAngle % sectorSize) - sectorSize / 2)) * density

                        let normalSignal = 0
                        if (ridgeProfile === 'Round') {
                            normalSignal = Math.cos(finalAngleSignal * 20)
                        } else if (ridgeProfile === 'Sharp') {
                            const t = (finalAngleSignal * 20) / (Math.PI * 2)
                            normalSignal = 2 * Math.abs(2 * (t - Math.floor(t + 0.5))) - 1
                        } else {
                            normalSignal = Math.cos(finalAngleSignal * 20) > 0 ? 0.8 : -0.8
                        }

                        totalR += (normalSignal * 0.5 + 0.5)

                    } else {
                        const v = sampleY / res
                        // Seamless Loop
                        const safeFreq = Math.round(waveFreq)
                        const waveOffset = Math.sin(v * Math.PI * 2 * safeFreq) * waveAmp

                        // Smooth Bell Curve
                        const bell = (1 - Math.cos(v * Math.PI * 2)) * 0.5
                        const curveOffset = bell * curvature

                        const xNorm = sampleX / res
                        angle = (xNorm + waveOffset + curveOffset) * Math.PI * 2 * density

                        let normalX = 0
                        if (ridgeProfile === 'Round') {
                            normalX = Math.cos(angle)
                        } else if (ridgeProfile === 'Sharp') {
                            const t = angle / (Math.PI * 2)
                            normalX = 2 * Math.abs(2 * (t - Math.floor(t + 0.5))) - 1
                            normalX *= -1
                        } else {
                            const t = Math.cos(angle)
                            normalX = t > 0 ? 0.9 : -0.9
                        }

                        totalR += (normalX * 0.5 + 0.5)
                    }
                }
            }

            // Average the 4 samples
            const avgR = (totalR / 4) * 255
            const g = 128
            const b = 255

            const idx = (y * res + x) * 4
            data[idx] = avgR
            data[idx + 1] = g
            data[idx + 2] = b
            data[idx + 3] = 255
        }
    }

    ctx.putImageData(imgData, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = 16 // Max quality
    texture.needsUpdate = true
    return texture
}

export default function GlassOverlay() {
    const { width, height } = useThree((state) => state.viewport)

    const { glass } = useStore()

    // Leva Removed

    // Use "glass" from store instead of "config"
    const config = glass

    // Debounce the expensive texture generation props
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
        }, 200) // 200ms delay

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

    // Memoize the texture so we don't regenerate it every frame
    // Use debouncedConfig for dependencies
    const flutedNormalMap = useMemo(() => {
        const tex = generateFlutedNormalMap(
            debouncedConfig.rippleDensity,
            debouncedConfig.waveFreq,
            debouncedConfig.waviness,
            debouncedConfig.patternType as 'Linear' | 'Kaleidoscope',
            debouncedConfig.segments,
            debouncedConfig.ridgeProfile as 'Round' | 'Sharp' | 'Square',
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

        // Always apply rotation
        flutedNormalMap.rotation = (config.patternRotation * Math.PI) / 180

        if (config.animate) {
            // Update Offset
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
