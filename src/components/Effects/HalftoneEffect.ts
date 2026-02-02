
import { Effect } from 'postprocessing'
import { Uniform } from 'three'

const fragmentShader = `
uniform float uShape; // 0: Round, 1: Square, 2: Line
uniform float uResolution;
uniform float uScale;
uniform float uMonochrome; // 0.0: Color, 1.0: B&W
uniform float uRotate;

float luminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

// 2D Rotation matrix
mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle),
                sin(angle), cos(angle));
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 color = inputColor.rgb;
    float alpha = inputColor.a;

    // Aspect corrected UVs for square grid
    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
    vec2 st = uv * aspect;
    
    // Rotate UVs
    if (uRotate != 0.0) {
        st -= aspect * 0.5;
        st = rotate2d(radians(uRotate)) * st;
        st += aspect * 0.5;
    }

    // Grid cells
    vec2 gridUV = fract(st * uResolution); // 0-1 within cell
    vec2 cellID = floor(st * uResolution); // Integer ID of cell
    
    // Center of cell 
    // We sample specific points for stability if needed, but per-pixel is standard for this effect style
    
    float luma = luminance(color);
    
    // Distance from center of this cell
    vec2 dist = gridUV - 0.5;
    
    float radius = sqrt(luma) * 0.5 * uScale; // Max radius 0.5 (touching edges)
    float pattern = 0.0;

    // SHAPE LOGIC
    if (uShape < 0.5) { // ROUND
        if (length(dist) < radius) {
             pattern = 1.0;
        }
    } else if (uShape < 1.5) { // SQUARE
        // Radius acts as half-size
        if (abs(dist.x) < radius && abs(dist.y) < radius) {
            pattern = 1.0;
        }
    } else { // LINE
        // Lines based on Rotated Y
        float lineDist = abs(gridUV.y - 0.5);
        if (lineDist < radius) {
            pattern = 1.0;
        }
    }

    vec3 finalColor = vec3(0.0);
    
    if (uMonochrome > 0.5) {
        // Monochrome: Pattern is intensity
        finalColor = vec3(pattern); 
    } else {
        // Color: Mask original color
        finalColor = color * pattern; 
    }

    outputColor = vec4(finalColor, alpha);
}
`

export class HalftoneEffect extends Effect {
    constructor({
        shape = 'Round',
        resolution = 100,
        scale = 1.0,
        monochrome = false,
        rotate = 0
    }: any = {}) {
        let shapeVal = 0;
        if (shape === 'Square') shapeVal = 1.0;
        if (shape === 'Line') shapeVal = 2.0;

        super('HalftoneEffect', fragmentShader, {
            uniforms: new Map<string, Uniform>([
                ['uShape', new Uniform(shapeVal)],
                ['uResolution', new Uniform(resolution)],
                ['uScale', new Uniform(scale)],
                ['uMonochrome', new Uniform(monochrome ? 1.0 : 0.0)],
                ['uRotate', new Uniform(rotate)]
            ])
        })
    }
}
