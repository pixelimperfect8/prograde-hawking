
import { Effect } from 'postprocessing'
import { Uniform, Color } from 'three'

const fragmentShader = `
uniform float uTime;
uniform float uSpeed;
uniform float uDensity;
uniform vec3 uColor;
uniform float uOpacity;
uniform sampler2D uCharMap;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float luminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Grid setup
    float columns = 40.0 * uDensity;
    float aspects = resolution.x / resolution.y;
    float rows = columns / aspects * 2.0; // Taller cells for code look
    
    vec2 grid = vec2(columns, rows);
    vec2 st = uv * grid;
    
    vec2 ipos = floor(st);
    vec2 fpos = fract(st);
    
    // Gradient Influence
    // We sample the input color at this grid position to affect speed
    // This makes the characters "ride" the gradient waves
    vec3 bgCol = texture2D(inputBuffer, uv).rgb;
    float bgLuma = luminance(bgCol);
    
    // Base Speed + Gradient Variance
    // Lighter areas move faster? Or slower? Let's try Faster.
    float speedMap = uSpeed * (1.0 + bgLuma * 2.0); 
    
    // Column offset
    float colRandom = random(vec2(ipos.x, 0.0));
    
    // Vertical Scrolling
    // We add uTime scaled by our speed factors
    // To make it continuous, we use simple linear time and offset the CHAR lookup
    float scroll = uTime * speedMap + colRandom * 100.0;
    
    // Character Selection
    // We select a random character from the texture (16x16 grid)
    // Changing the 'seed' basically changes the character.
    // We want the character to change slowly over time (glitch/update)
    // AND we want the row to determine the character so they appear to fall.
    
    // 'Falling' effect: the character ID depends on (y + scroll)
    float charIndex = floor(ipos.y + scroll);
    
    // Random seed for this specific character instance
    float charSeed = random(vec2(ipos.x, charIndex));
    
    // Map charSeed (0-1) to texture UVs
    // Texture is 16x16 chars
    float charsPerRow = 16.0;
    
    // Pick a random frame from the 16x16 grid
    vec2 charGridPos = vec2(
        floor(charSeed * charsPerRow),
        floor(random(vec2(charSeed, 1.0)) * charsPerRow)
    );
    
    // Function to sample glyph
    vec2 charUV = (charGridPos + fpos) / charsPerRow;
    
    // Sample Texture
    float pattern = texture2D(uCharMap, charUV).r;
    
    // Tail / Fade Effect using background luma or just distance?
    // Use the fraction of the scroll to create a "rain" drop fade?
    // Simple approach: Random brightness per character
    float bright = random(vec2(charIndex, charSeed));
    
    // Threshold to keep some cells empty (Matrix spacing)
    float visibility = step(0.3, bright); // 30% empty
    
    // Glitch/Flicker - occasionally invert or brighten
    float flicker = step(0.98, random(vec2(uv.y * uTime, uv.x)));
    
    vec3 finalColor = uColor * pattern * visibility;
    
    // Add "Glitch" white pop
    finalColor += vec3(1.0) * pattern * flicker * 0.5;

    // Composite: Overlay on top of original
    outputColor = vec4(inputColor.rgb + finalColor * uOpacity, inputColor.a);
}
`

export class DataGlitchEffect extends Effect {
    constructor({
        speed = 0.5,
        density = 1.0,
        color = '#00ff00',
        opacity = 0.8,
        charMap = null
    }: any = {}) {
        super('DataGlitchEffect', fragmentShader, {
            uniforms: new Map<string, Uniform>([
                ['uTime', new Uniform(0)],
                ['uSpeed', new Uniform(speed)],
                ['uDensity', new Uniform(density)],
                ['uColor', new Uniform(new Color(color))],
                ['uOpacity', new Uniform(opacity)],
                ['uCharMap', new Uniform(charMap)]
            ])
        })
    }

    update(_renderer: any, _inputBuffer: any, deltaTime: number) {
        this.uniforms.get('uTime')!.value += deltaTime
    }
}
