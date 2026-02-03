
import { Effect } from 'postprocessing'
import { Uniform, Color } from 'three'
import * as THREE from 'three'

const fragmentShader = `
uniform float uShape; // 0: Round, 1: Square, 2: Line
uniform float uResolution;
uniform float uScale;
uniform float uMonochrome; // 0.0: Color, 1.0: B&W/Tinted
uniform float uRotate;
uniform vec3 uColor;
uniform vec3 uBgColor;
uniform vec2 uAspect; 

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

    // Aspect corrected UVs
    vec2 st = uv * uAspect;
    
    // Rotate UVs
    if (uRotate != 0.0) {
        vec2 center = 0.5 * uAspect;
        st -= center;
        st = rotate2d(radians(uRotate)) * st;
        st += center;
    }

    // Grid cells
    vec2 gridUV = fract(st * uResolution); // 0-1 within cell
    vec2 cellID = floor(st * uResolution); // Integer ID of cell
    
    float luma = luminance(color);
    
    // Distance from center of this cell
    vec2 dist = gridUV - 0.5;
    
    float radius = sqrt(luma) * 0.5 * uScale; 
    float pattern = 0.0;

    // SHAPE LOGIC
    if (uShape < 0.5) { // ROUND
        if (length(dist) < radius) {
             pattern = 1.0;
        }
    } else if (uShape < 1.5) { // SQUARE
        if (abs(dist.x) < radius && abs(dist.y) < radius) {
            pattern = 1.0;
        }
    } else { // LINE
        float lineDist = abs(gridUV.y - 0.5);
        if (lineDist < radius) {
            pattern = 1.0;
        }
    }

    vec3 finalColor = vec3(0.0);
    
    if (uMonochrome > 0.5) {
        // Monochrome: Pattern is 1 (Dot) -> uColor, 0 (Gap) -> uBgColor
        finalColor = mix(uBgColor, uColor, pattern);
    } else {
        // Color: Pattern is 1 -> Original Color, 0 -> uBgColor
        finalColor = mix(uBgColor, color, pattern);
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
        color = '#ffffff',
        bgColor = '#000000',
        rotate = 0,
        aspect = 1.77
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
                ['uColor', new Uniform(new Color(color))],
                ['uBgColor', new Uniform(new Color(bgColor))],
                ['uRotate', new Uniform(rotate)],
                ['uAspect', new Uniform(new THREE.Vector2(aspect, 1.0))]
            ])
        })
    }
}
