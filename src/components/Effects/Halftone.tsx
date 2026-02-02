
import { forwardRef, useMemo } from 'react'
import { HalftoneEffect } from './HalftoneEffect'

export const Halftone = forwardRef(({
    shape = 'Round',
    resolution = 100,
    scale = 1.0,
    monochrome = false,
    color = '#ffffff',
    rotate = 0.0
}: any, ref) => {
    const effect = useMemo(() => new HalftoneEffect({ shape, resolution, scale, monochrome, color, rotate }), [shape, resolution, scale, monochrome, color, rotate])
    return <primitive object={effect} ref={ref} dispose={null} />
})
