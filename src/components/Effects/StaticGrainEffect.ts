import { Effect, BlendFunction } from 'postprocessing'
import { Uniform } from 'three'

const fragmentShader = `
uniform float opacity;

// Simple Gold Noise (high frequency, no patterns)
// Based on: https://www.shadertoy.com/view/ltB3zD
float random(vec2 uv) {
    return fract(tan(distance(uv * 1.61803398875, uv) * 1.61803398875) * uv.x);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Generate static noise based purely on UV (no time)
    // Scale UV by huge number to get pixel-level grain
    float noise = random(uv * 10000.0);
    
    // Blend with input
    // We want to darken/lighten slightly
    vec3 grainColor = vec3(noise);
    
    // Mix using Overlay-like logic approx
    // Or just simple lerp since it's "static grain overlay"
    vec3 color = inputColor.rgb;
    
    // Apply grain
    // Screen/Multiply approach or just mix
    // Simple mix for texture feel
    color = mix(color, grainColor, opacity * 0.5); // 0.5 factor to soften it

    outputColor = vec4(color, inputColor.a);
}
`

export class StaticGrainEffect extends Effect {
    constructor({ opacity = 0.05, blendFunction = BlendFunction.NORMAL } = {}) {
        super('StaticGrainEffect', fragmentShader, {
            blendFunction,
            uniforms: new Map([
                ['opacity', new Uniform(opacity)]
            ])
        })
    }



}
