import { EffectComposer, Noise, Bloom, Scanline, ChromaticAberration, Vignette, Sepia } from '@react-three/postprocessing'

import { BlendFunction } from 'postprocessing'
import { useStore } from '../../store'
import * as THREE from 'three'
import { VintageFilm } from './VintageFilm'

export default function PostFX() {
    const { postfx } = useStore()

    // Leva controls removed
    // const { postfx, setPostFX } = useStore() is already above

    const noiseOpacity = postfx.dither ? postfx.ditherOpacity : 0
    const bloomIntensity = postfx.bloom ? postfx.bloomIntensity : 0

    // CRT Logic: Render always but set values to 0 if disabled
    const scanlineOpacity = postfx.crt ? postfx.scanlines : 0
    const aberrationOffset = postfx.crt ? postfx.crtAberration : 0
    const vignetteDarkness = postfx.crt ? postfx.vignette : 0

    // Film Logic
    const sepiaIntensity = postfx.film ? postfx.filmSepia : 0
    const scratches = postfx.film ? postfx.filmScratches : 0
    const dirt = postfx.film ? postfx.filmDirt : 0

    return (
        <EffectComposer>
            {/* Dither / Noise */}
            <Noise
                premultiply
                blendFunction={BlendFunction.OVERLAY}
                opacity={noiseOpacity}
            />

            {/* Bloom */}
            <Bloom
                luminanceThreshold={postfx.bloomThreshold}
                mipmapBlur
                intensity={bloomIntensity}
                luminanceSmoothing={postfx.bloomSmoothing}
            />

            {/* Sepia (Old Film) */}
            <Sepia
                intensity={sepiaIntensity}
                blendFunction={BlendFunction.NORMAL}
            />

            {/* Vintage Film Artifacts */}
            <VintageFilm
                scratches={scratches}
                dirt={dirt}
            />

            {/* CRT Effects */}
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
        </EffectComposer>
    )
}
