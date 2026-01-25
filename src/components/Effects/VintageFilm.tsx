import React, { forwardRef, useMemo } from 'react'
import { VintageFilmEffect } from './VintageFilmEffect'

export const VintageFilm = forwardRef(({ scratches = 0.5, dirt = 0.5 }, ref) => {
    const effect = useMemo(() => new VintageFilmEffect({ scratches, dirt }), [scratches, dirt])
    return <primitive ref={ref} object={effect} dispose={null} />
})
