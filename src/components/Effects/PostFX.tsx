import { EffectComposer, Noise, Bloom, Scanline, ChromaticAberration, Vignette, Sepia } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'
import { useStore } from '../../store'
import * as THREE from 'three'
import { VintageFilm } from './VintageFilm'
import { StaticGrain } from './StaticGrain'

export default function PostFX() {
    const { postfx } = useStore()



    // Logic: 
    // - Flow Mode: Use global `postfx.grain` (Standardized)
    // - Dither: Enabled if `postfx.dither` is true
    // - Bloom: Enabled if `postfx.bloom` is true

    const grainOpacity = postfx.grain || 0;
    const ditherOpacity = postfx.dither ? postfx.ditherOpacity : 0;
    const effectiveDither = ditherOpacity;
    const bloomIntensity = postfx.bloom ? postfx.bloomIntensity : 0

    // CRT Logic
    const scanlineOpacity = postfx.crt ? postfx.scanlines : 0
    const aberrationOffset = postfx.crt ? postfx.crtAberration : 0
    const vignetteDarkness = postfx.crt ? postfx.vignette : 0

    // Film Logic
    const sepiaIntensity = postfx.film ? postfx.filmSepia : 0
    const scratches = postfx.film ? postfx.filmScratches : 0
    const dirt = postfx.film ? postfx.filmDirt : 0

    return (
        <EffectComposer>
            {/* 1. Static Grain (Texture) */}
            {grainOpacity > 0 ? (
                <StaticGrain
                    opacity={grainOpacity}
                    blendFunction={BlendFunction.OVERLAY}
                />
            ) : <></>}

            {/* 2. Animated Noise (Dither) */}
            {effectiveDither > 0 ? (
                <Noise
                    premultiply
                    blendFunction={BlendFunction.OVERLAY}
                    opacity={effectiveDither}
                />
            ) : <></>}

            {/* Bloom */}
            {bloomIntensity > 0 ? (
                <Bloom
                    luminanceThreshold={postfx.bloomThreshold}
                    mipmapBlur
                    intensity={bloomIntensity}
                    luminanceSmoothing={postfx.bloomSmoothing}
                />
            ) : <></>}

            {/* Sepia */}
            {postfx.film ? (
                <Sepia
                    intensity={sepiaIntensity}
                    blendFunction={BlendFunction.NORMAL}
                />
            ) : <></>}

            {/* Vintage Film */}
            {postfx.film ? (
                <VintageFilm
                    scratches={scratches}
                    dirt={dirt}
                />
            ) : <></>}

            {/* CRT */}
            {postfx.crt ? (
                <>
                    <Scanline
                        blendFunction={BlendFunction.OVERLAY}
                        density={1.5}
                        opacity={scanlineOpacity}
                    />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={new THREE.Vector2(aberrationOffset, aberrationOffset * 0.5)}
                    />
                    <Vignette
                        offset={0.3}
                        darkness={vignetteDarkness}
                        eskil={false}
                        blendFunction={BlendFunction.NORMAL}
                    />
                </>
            ) : <></>}
        </EffectComposer>
    )
}
