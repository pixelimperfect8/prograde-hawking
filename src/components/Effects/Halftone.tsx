
import { forwardRef, useMemo } from 'react'
import { HalftoneEffect } from './HalftoneEffect'
import { useThree } from '@react-three/fiber'

export const Halftone = forwardRef(({
    shape = 'Round',
    resolution = 100,
    scale = 1.0,
    monochrome = false,
    color = '#ffffff',
    bgColor = '#000000',
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
        bgColor,
        rotate,
        aspect
    }), [shape, resolution, scale, monochrome, color, bgColor, rotate, aspect])

    return <primitive object={effect} ref={ref} dispose={null} />
})
