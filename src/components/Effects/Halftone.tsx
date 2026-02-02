
import { forwardRef, useMemo } from 'react'
import { HalftoneEffect } from './HalftoneEffect'
import { useThree } from '@react-three/fiber'

export const Halftone = forwardRef(({
    shape = 'Round',
    resolution = 100,
    scale = 1.0,
    monochrome = false,
    color = '#ffffff',
    rotate = 0.0
}: any, ref) => {
    const { size } = useThree()
    const aspect = size.width / size.height

    const effect = useMemo(() => new HalftoneEffect({
        shape,
        resolution,
        scale,
        monochrome,
        color,
        rotate,
        aspect
    }), [shape, resolution, scale, monochrome, color, rotate, aspect])

    // Reactive update for aspect ratio resize without full re-construction?
    // Actually useMemo handles re-construction if aspect changes.
    // Ideally we update uniform, but reconstruction is safe for now.

    return <primitive object={effect} ref={ref} dispose={null} />
})
