import { EffectComposer, Noise, Bloom } from '@react-three/postprocessing'
import { useControls } from 'leva'
import { BlendFunction } from 'postprocessing'

export default function PostFX() {
    const config = useControls('Effects', {
        // Noise / Dither
        dither: { value: true, label: 'Enable Dither' },
        opacity: { value: 0.5, min: 0, max: 0.5, step: 0.01, label: 'Grain Opacity' },

        // Bloom
        bloom: { value: true, label: 'Enable Bloom' },
        intensity: { value: 1.5, min: 0, max: 5, label: 'Bloom Intensity' },
        threshold: { value: 0.2, min: 0, max: 1, label: 'Bloom Threshold' },
        smoothing: { value: 0.9, min: 0, max: 1, label: 'Bloom Smoothing' }
    })

    // Strategy: Always render components but zero out effects if disabled.
    // This bypasses strict "children must be Element" check by always providing Elements.

    const noiseOpacity = config.dither ? config.opacity : 0
    const bloomIntensity = config.bloom ? config.intensity : 0

    return (
        <EffectComposer>
            <Noise
                premultiply
                blendFunction={BlendFunction.OVERLAY}
                opacity={noiseOpacity}
            />

            <Bloom
                luminanceThreshold={config.threshold}
                mipmapBlur
                intensity={bloomIntensity}
                luminanceSmoothing={config.smoothing}
            />
        </EffectComposer>
    )
}
