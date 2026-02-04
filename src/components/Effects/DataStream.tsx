
import { forwardRef, useMemo } from 'react'
import { DataGlitchEffect } from './DataGlitchEffect'
import * as THREE from 'three'

export const DataStream = forwardRef(({
    speed = 0.5,
    density = 1.0,
    color = '#00ff00',
    opacity = 0.8
}: any, ref) => {
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        const size = 1024
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!

        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, size, size)

        const cols = 16 // 16x16 grid of characters
        const charSize = size / cols

        ctx.font = `${charSize * 0.8}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = 'white'

        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝabcdefghijklmnopqrstuvxyz'

        for (let y = 0; y < cols; y++) {
            for (let x = 0; x < cols; x++) {
                const char = chars[Math.floor(Math.random() * chars.length)]
                // Randomly flip or rotate? Nah, keep simple first.
                ctx.fillText(char, x * charSize + charSize / 2, y * charSize + charSize / 2)
            }
        }

        const tex = new THREE.CanvasTexture(canvas)
        tex.minFilter = THREE.NearestFilter
        tex.magFilter = THREE.NearestFilter
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        return tex
    }, [])

    const effect = useMemo(() => new DataGlitchEffect({
        speed,
        density,
        color,
        opacity,
        charMap: texture
    }), [speed, density, color, opacity, texture])

    return <primitive object={effect} ref={ref} dispose={null} />
})
