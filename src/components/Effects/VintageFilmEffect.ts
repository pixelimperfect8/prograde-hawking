import { Effect } from 'postprocessing'
import { Uniform } from 'three'

const fragmentShader = `
uniform float uTime;
uniform float uScratches;
uniform float uDirt;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 color = inputColor.rgb;
    float time = uTime;

    // SCRACHES
    if (uScratches > 0.0) {
        float scratchTime = time * 20.0; // Fast movement
        float scratchX = floor(uv.x * 50.0 + random(vec2(floor(scratchTime), 0.0)) * 100.0) / 50.0;
        
        // Random scratch appearance
        float scratch = random(vec2(scratchX, floor(scratchTime)));
        
        // Thin lines
        float dist = abs(uv.x - scratchX);
        float line = smoothstep(0.002, 0.0, dist);
        
        // Threshold to make scratches sparse
        if (scratch > (1.0 - uScratches * 0.1)) { // 0.1 scale factor for intensity controls density
             color -= line * 0.3; // Dark scratches
        }
        
        // Random big scratches
         float bigScratch = random(vec2(uv.x + time * 10.0, 0.0));
         if (bigScratch > 0.995) {
             color -= 0.2 * uScratches;
         }
    }

    // DIRT / SPECKS
    if (uDirt > 0.0) {
        float dirtTime = floor(time * 12.0); // 12 FPS dirt
        vec2 dirtUV = uv;
        // Jitter dirt uv slightly
        dirtUV += vec2(random(vec2(dirtTime, 0.0)), random(vec2(0.0, dirtTime))) * 1.0;
        
        float dirt = random(dirtUV * 5.0 + dirtTime);
        float dirtThresh = 1.0 - (uDirt * 0.05); // Controls density
        
        if (dirt > dirtThresh) {
            // Check for circular shape (simple dot)
            // Actually, simple noise threshold is usually enough for "dirt"
            // Let's make it a bit more organic/blobby if possible, but noise is fine.
            color -= 0.4;
        }
        
        // Occasional vertical hair
        if (random(vec2(time, 5.0)) > 0.98) {
           float hairX = random(vec2(time, 1.0));
            // curved hair approximation? simple line for now
           float d = abs(uv.x - hairX + sin(uv.y * 10.0)*0.005);
           if (d < 0.001) color -= 0.4;
        }
    }

    outputColor = vec4(color, inputColor.a);
}
`

export class VintageFilmEffect extends Effect {
    constructor({ scratches = 0.5, dirt = 0.5 } = {}) {
        super('VintageFilmEffect', fragmentShader, {
            uniforms: new Map([
                ['uTime', new Uniform(0)],
                ['uScratches', new Uniform(scratches)],
                ['uDirt', new Uniform(dirt)],
            ]),
        })
    }

    update(renderer, inputBuffer, deltaTime) {
        this.uniforms.get('uTime').value += deltaTime
    }
}
