import { useMemo } from 'react'
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
    ridgeProfile: 'Round' | 'Sharp' | 'Square'
) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Fill with neutral normal
    ctx.fillStyle = 'rgb(128, 128, 255)'
    ctx.fillRect(0, 0, 512, 512)

    const imgData = ctx.getImageData(0, 0, 512, 512)
    const data = imgData.data

    const cx = 256
    const cy = 256

    for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
            let angle = 0

            if (patternType === 'Kaleidoscope') {
                const dx = x - cx
                const dy = y - cy
                const dist = Math.sqrt(dx * dx + dy * dy) / 256

                const waveOffset = Math.sin(dist * Math.PI * 2 * waveFreq) * waveAmp
                let angleRad = Math.atan2(dy, dx)

                const effectiveAngle = angleRad + waveOffset
                const sectorSize = (Math.PI * 2) / segments

                const finalAngleSignal = (Math.abs((effectiveAngle % sectorSize) - sectorSize / 2)) * density

                // Normal calculation based on profile
                let normalSignal = 0

                if (ridgeProfile === 'Round') {
                    normalSignal = Math.cos(finalAngleSignal * 20)
                } else if (ridgeProfile === 'Sharp') {
                    // Triangle wave
                    const t = (finalAngleSignal * 20) / (Math.PI * 2)
                    normalSignal = 2 * Math.abs(2 * (t - Math.floor(t + 0.5))) - 1
                } else {
                    // Square
                    normalSignal = Math.cos(finalAngleSignal * 20) > 0 ? 0.8 : -0.8
                }

                const r = (normalSignal * 0.5 + 0.5) * 255
                const g = 128
                const b = 255

                const idx = (y * 512 + x) * 4
                data[idx] = r
                data[idx + 1] = g
                data[idx + 2] = b
                data[idx + 3] = 255

            } else {
                const v = y / 512
                const waveOffset = Math.sin(v * Math.PI * 2 * waveFreq) * waveAmp

                const xNorm = x / 512
                angle = (xNorm + waveOffset) * Math.PI * 2 * density

                let normalX = 0
                if (ridgeProfile === 'Round') {
                    normalX = Math.cos(angle)
                } else if (ridgeProfile === 'Sharp') {
                    // Triangle wave logic
                    const t = angle / (Math.PI * 2)
                    normalX = 2 * Math.abs(2 * (t - Math.floor(t + 0.5))) - 1
                    // Invert for better look
                    normalX *= -1
                } else {
                    // Square logic
                    const t = Math.cos(angle)
                    normalX = t > 0 ? 0.9 : -0.9
                }

                // Map -1..1 to 0..255
                const r = (normalX * 0.5 + 0.5) * 255
                const g = 128
                const b = 255

                const idx = (y * 512 + x) * 4
                data[idx] = r
                data[idx + 1] = g
                data[idx + 2] = b
                data[idx + 3] = 255
            }
        }
    }

    ctx.putImageData(imgData, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
}

export default function GlassOverlay() {
    const { width, height } = useThree((state) => state.viewport)

    const { glass } = useStore()

    // Leva Removed

    // Use "glass" from store instead of "config"
    const config = glass

    // Memoize the texture so we don't regenerate it every frame
    const flutedNormalMap = useMemo(() => {
        const tex = generateFlutedNormalMap(
            config.rippleDensity,
            config.waveFreq,
            config.waviness,
            config.patternType as 'Linear' | 'Kaleidoscope',
            config.segments,
            config.ridgeProfile as 'Round' | 'Sharp' | 'Square'
        )
        if (tex) {
            tex.center.set(0.5, 0.5)
        }
        return tex
    }, [config.rippleDensity, config.waveFreq, config.waviness, config.patternType, config.segments, config.ridgeProfile])

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
        <mesh position={[0, 0, 1]}>
            <planeGeometry args={[width, height]} />
            <MeshTransmissionMaterial
                {...config}
                background={new THREE.Color('#000000')}
                normalMap={flutedNormalMap}
                normalScale={new THREE.Vector2(config.fluteScale, config.fluteScale)}
                resolution={512}
            />
        </mesh>
    )
}
