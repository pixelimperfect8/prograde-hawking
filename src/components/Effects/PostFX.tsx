import { EffectComposer, Noise, Bloom, Scanline, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { useControls } from 'leva'
import { BlendFunction } from 'postprocessing'
import { useStore } from '../../store'
import * as THREE from 'three'

export default function PostFX() {
    const { postfx, setPostFX } = useStore()

    useControls('Effects', {
        // Noise / Dither
        dither: { value: postfx.dither, onChange: (v) => setPostFX({ dither: v }) },
        opacity: { value: postfx.ditherOpacity, min: 0, max: 1.0, step: 0.01, label: 'Dither Strength', onChange: (v) => setPostFX({ ditherOpacity: v }) },

        // Bloom
        bloom: { value: postfx.bloom, onChange: (v) => setPostFX({ bloom: v }) },
        intensity: { value: postfx.bloomIntensity, min: 0, max: 5, label: 'Bloom Intensity', onChange: (v) => setPostFX({ bloomIntensity: v }) },
        threshold: { value: postfx.bloomThreshold, min: 0, max: 1, label: 'Bloom Threshold', onChange: (v) => setPostFX({ bloomThreshold: v }) },
        smoothing: { value: postfx.bloomSmoothing, min: 0, max: 1, label: 'Bloom Smoothing', onChange: (v) => setPostFX({ bloomSmoothing: v }) },

        // CRT Mode
        crt: { value: postfx.crt, label: 'CRT Mode', onChange: (v) => setPostFX({ crt: v }) },
        scanlines: { value: postfx.scanlines, min: 0, max: 1, render: (get) => get('Effects.crt'), onChange: (v) => setPostFX({ scanlines: v }) },
        crtAberration: { value: postfx.crtAberration, min: 0, max: 0.1, step: 0.001, label: 'Aberration', render: (get) => get('Effects.crt'), onChange: (v) => setPostFX({ crtAberration: v }) },
        vignette: { value: postfx.vignette, min: 0, max: 1, render: (get) => get('Effects.crt'), onChange: (v) => setPostFX({ vignette: v }) },
    }, [postfx])

    const noiseOpacity = postfx.dither ? postfx.ditherOpacity : 0
    const bloomIntensity = postfx.bloom ? postfx.bloomIntensity : 0

    // CRT Logic: Render always but set values to 0 if disabled
    const scanlineOpacity = postfx.crt ? postfx.scanlines : 0
    const aberrationOffset = postfx.crt ? postfx.crtAberration : 0
    const vignetteDarkness = postfx.crt ? postfx.vignette : 0

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
