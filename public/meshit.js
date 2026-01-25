/**
 * MESHIT Gradient Renderer
 * Standalone WebGL gradient renderer for embedding
 * 
 * Usage:
 * <div data-meshit='{"c1":"#ff0055","c2":"#00ff99","c3":"#5500ff","c4":"#ffaa00","speed":0.4}'></div>
 * <script src="https://your-domain.com/meshit.js"></script>
 */
(function () {
    'use strict';

    // Vertex Shader
    const vertexShader = `
        attribute vec2 a_position;
        varying vec2 vUv;
        void main() {
            vUv = a_position * 0.5 + 0.5;
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    // Fragment Shader (Simplex 4D Noise for seamless animation)
    const fragmentShader = `
        precision highp float;
        
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform float uSpeed;
        uniform float uNoiseDensity;
        uniform float uNoiseStrength;
        
        varying vec2 vUv;

        // Simplex noise functions
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            
            vec3 i  = floor(v + dot(v, vec3(C.y)));
            vec3 x0 = v - i + dot(i, vec3(C.x));
            
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            
            vec3 x1 = x0 - i1 + C.x;
            vec3 x2 = x0 - i2 + C.y;
            vec3 x3 = x0 - D.yyy;
            
            i = mod(i, 289.0);
            vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                      
            float n_ = 1.0/7.0;
            vec3 ns = n_ * D.wyz - D.xzx;
            
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
            vec2 uv = vUv;
            float time = uTime * uSpeed;
            
            float noise1 = snoise(vec3(uv * uNoiseDensity, time));
            float noise2 = snoise(vec3(uv * (uNoiseDensity * 0.5), time * 0.5 + 10.0));
            
            uv += noise1 * uNoiseStrength;
            
            vec3 mix1 = mix(uColor1, uColor2, smoothstep(0.0, 1.0, uv.x + noise2 * 0.2));
            vec3 mix2 = mix(uColor3, uColor4, smoothstep(0.0, 1.0, uv.x - noise2 * 0.2));
            
            vec3 finalColor = mix(mix1, mix2, smoothstep(0.0, 1.0, uv.y + noise1 * 0.2));
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    // Parse hex color to RGB array (0-1 range)
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        return [r, g, b];
    }

    // Create shader program
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(gl, vs, fs) {
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    // Initialize a single gradient instance
    function initGradient(container, config) {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        container.appendChild(canvas);

        // Resize handler
        function resize() {
            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
        }
        resize();
        window.addEventListener('resize', resize);

        // Get WebGL context
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        // Create shaders and program
        const vs = createShader(gl, gl.VERTEX_SHADER, vertexShader);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
        const program = createProgram(gl, vs, fs);

        // Setup geometry (full-screen quad)
        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]);
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        // Get attribute/uniform locations
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        const uTime = gl.getUniformLocation(program, 'uTime');
        const uColor1 = gl.getUniformLocation(program, 'uColor1');
        const uColor2 = gl.getUniformLocation(program, 'uColor2');
        const uColor3 = gl.getUniformLocation(program, 'uColor3');
        const uColor4 = gl.getUniformLocation(program, 'uColor4');
        const uSpeed = gl.getUniformLocation(program, 'uSpeed');
        const uNoiseDensity = gl.getUniformLocation(program, 'uNoiseDensity');
        const uNoiseStrength = gl.getUniformLocation(program, 'uNoiseStrength');

        // Parse config colors
        const c1 = hexToRgb(config.c1 || '#ff0055');
        const c2 = hexToRgb(config.c2 || '#00ff99');
        const c3 = hexToRgb(config.c3 || '#5500ff');
        const c4 = hexToRgb(config.c4 || '#ffaa00');
        const speed = config.speed || 0.4;
        const density = config.density || 2.0;
        const strength = config.strength || 0.5;

        // Animation loop
        let startTime = performance.now();
        function render() {
            const time = (performance.now() - startTime) / 1000;

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);

            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1f(uTime, time);
            gl.uniform3fv(uColor1, c1);
            gl.uniform3fv(uColor2, c2);
            gl.uniform3fv(uColor3, c3);
            gl.uniform3fv(uColor4, c4);
            gl.uniform1f(uSpeed, speed);
            gl.uniform1f(uNoiseDensity, density);
            gl.uniform1f(uNoiseStrength, strength);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            requestAnimationFrame(render);
        }

        render();
    }

    // Auto-initialize on DOM ready
    function init() {
        const elements = document.querySelectorAll('[data-meshit]');
        elements.forEach(function (el) {
            try {
                const config = JSON.parse(el.getAttribute('data-meshit'));
                initGradient(el, config);
            } catch (e) {
                console.error('MESHIT: Invalid config JSON', e);
            }
        });
    }

    // Run init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for manual initialization
    window.Meshit = {
        init: init,
        render: initGradient
    };
})();
