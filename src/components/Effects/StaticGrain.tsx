import { forwardRef, useMemo } from 'react'
import { StaticGrainEffect } from './StaticGrainEffect'
import { BlendFunction } from 'postprocessing'

interface StaticGrainProps {
    opacity?: number
    blendFunction?: BlendFunction
}

export const StaticGrain = forwardRef<any, StaticGrainProps>(({ opacity = 0.05, blendFunction = BlendFunction.OVERLAY }, ref) => {
    const effect = useMemo(() => new StaticGrainEffect({ opacity, blendFunction }), [opacity, blendFunction])
    return <primitive ref={ref} object={effect} dispose={null} />
})
