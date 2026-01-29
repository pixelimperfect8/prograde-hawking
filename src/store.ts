import { create } from 'zustand'

export const PRESETS = {
    'Calm': {
        color1: '#4facfe',
        color2: '#00f2fe',
        color3: '#a18cd1',
        color4: '#fbc2eb',
        speed: 0.1,
        noiseDensity: 1.2,
        noiseStrength: 0.2
    },
    'Neon': {
        color1: '#ff0055',
        color2: '#00ff99',
        color3: '#5500ff',
        color4: '#ffaa00',
        speed: 0.4,
        noiseDensity: 2.0,
        noiseStrength: 0.5
    },
    'Ocean': {
        color1: '#003366',
        color2: '#006699',
        color3: '#33cccc',
        color4: '#0099ff',
        speed: 0.15,
        noiseDensity: 0.8,
        noiseStrength: 0.3
    },
    'Sunset': {
        color1: '#ff4e50',
        color2: '#f9d423',
        color3: '#f12711',
        color4: '#f5af19',
        speed: 0.1,
        noiseDensity: 1.5,
        noiseStrength: 0.2
    },
    'Deep Space': {
        color1: '#0f2027',
        color2: '#203a43',
        color3: '#2c5364',
        color4: '#5c258d',
        speed: 0.05,
        noiseDensity: 2.5,
        noiseStrength: 0.1
    }
}

export const TRENDY_PALETTES = [
    ['#FF9A9E', '#FECFEF', '#FFD1FF', '#FAD0C4'],
    ['#a18cd1', '#fbc2eb', '#fad0c4', '#ffd1ff'],
    ['#84fab0', '#8fd3f4', '#a1c4fd', '#c2e9fb'],
    ['#fccb90', '#d57eeb', '#e0c3fc', '#8ec5fc'],
    ['#e0c3fc', '#8ec5fc', '#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7', '#2af598', '#22e4ac'],
    ['#fa709a', '#fee140', '#ff9a9e', '#fecfef'],
    ['#30cfd0', '#330867', '#5f2c82', '#49a09d'],
    ['#667eea', '#764ba2', '#6B8DD6', '#8E37D7'],
    ['#00c6fb', '#005bea', '#4facfe', '#00f2fe'],
    ['#FA8BFF', '#2BD2FF', '#2BFF88', '#FFFF00'],
    ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
    ['#111111', '#FF0033', '#FFFFFF', '#00FFCC'],
    ['#FF5F6D', '#FFC371', '#2C3E50', '#FD746C'],
    ['#833ab4', '#fd1d1d', '#fcb045', '#000000'],
    ['#000000', '#FFFFFF', '#FF0099', '#33CCFF'],
    ['#2b5876', '#4e4376', '#F0F2F0', '#000DFF'],
    ['#AAFFA9', '#11FFBD', '#743477', '#B22222'],
    ['#FFD700', '#202020', '#FF0000', '#FFFFFF'],
    ['#9D50BB', '#6E48AA', '#F3F9A7', '#CAC531'],
]

interface State {
    gradient: {
        color1: string
        color2: string
        color3: string
        color4: string
        speed: number
        noiseDensity: number
        noiseStrength: number
        wireframe: boolean
        kaleidoscope: boolean
        kSegments: number
        loop: boolean
    }
    // Existing slices...
    glass: {
        enabled: boolean
        transmission: number
        thickness: number
        roughness: number
        chromaticAberration: number
        fluteScale: number
        patternType: 'Linear' | 'Kaleidoscope'
        ridgeProfile: 'Round' | 'Sharp' | 'Square'
        segments: number
        rippleDensity: number
        waviness: number
        waveFreq: number
        animate: boolean
        patternRotation: number
        flowSpeed: number
        flowDirection: number
        curvature: number
    } // End of Glass
    ripples: {
        color: string
        speed: number
        cellDensity: number
        spread: number
        backgroundColor: string
        effectType: 'Static' | 'Pulse' | 'Expand'
    }

    lava: {
        color1: string
        color2: string
        color3: string
        background: string
        speed: number
        threshold: number
    }
    blob: {
        blob1: { color: string, size: number, offsetX: number, offsetY: number }
        blob2: { color: string, size: number, offsetX: number, offsetY: number }
        background: { color: string }
        noise: number
        direction: 'Top-to-Bottom' | 'Bottom-to-Top' | 'Left-to-Right' | 'Right-to-Left'
        animation: {
            enabled: boolean
            type: 'Pulse' | 'Float' | 'Breathe'
            speed: number
        }
    }
    glow: {
        color1: string
        color2: string
        radius1: number
        radius2: number
        intensity: number
        pulseSpeed: number
        pos1: { x: number, y: number }
        pos2: { x: number, y: number }
    }
    advancedGradient: {
        stops: Array<{ id: string, color: string, pos: number, opacity: number }>
        angle: number // 0-360
        animation: 'Static' | 'Flow' | 'Pulse' // Pulse = Breathe
        speed: number
        roughness: number
    }
    liquidMetal: {
        colors: string[]
        metalness: number
        roughness: number
        speed: number
        distortion: number
    }
    cubicGlass: {
        colors: string[]
        gridSize: number
        speed: number
        smoothness: number
    }

    orbs: {
        color1: string
        color2: string
        color3: string
        color4: string
        speed: number
        blur: number
        scale: number
    }
    fluid: {
        color1: string
        color2: string
        color3: string
        color4: string
        background: string
        speed: number
        density: number
        strength: number
        smoothing: number
        complexity: number
    }
    // New PostFX Slice
    postfx: {
        dither: boolean
        ditherOpacity: number
        bloom: boolean
        bloomIntensity: number
        bloomThreshold: number
        bloomSmoothing: number
        crt: boolean
        scanlines: number
        crtAberration: number
        vignette: number
        film: boolean
        filmSepia: number
        filmScratches: number
        filmDirt: number
        grain: number
    }
    flowGradient: {
        color1: string
        color2: string
        color3: string
        color4: string
        speed: number
        noiseFreq: { x: number, y: number }
        noiseAmp: number
        density: number
        grain: number
    }
    // Scene Slice
    scene: {
        bgMode: 'Gradient' | 'Solid + Glow' | 'Lava Lamp' | 'Blob Stack' | 'Orbs' | 'Acid Trip' | 'Ripples' | 'Linear Gradient' | 'Liquid Metal' | 'Cubic' | 'Flow Gradient'
        solidColor: string
    }
    logo: string | null
    // Intro State
    appState: 'intro' | 'animating' | 'ready'

    setGradient: (partial: Partial<State['gradient']>) => void
    setGlass: (partial: Partial<State['glass']>) => void
    setLava: (partial: Partial<State['lava']>) => void
    setBlob: (partial: Partial<State['blob']>) => void
    setGlow: (partial: Partial<State['glow']>) => void
    setOrbs: (partial: Partial<State['orbs']>) => void
    setFluid: (partial: Partial<State['fluid']>) => void
    setRipples: (partial: Partial<State['ripples']>) => void

    setPostFX: (partial: Partial<State['postfx']>) => void
    setScene: (partial: Partial<State['scene']>) => void
    setAdvancedGradient: (partial: Partial<State['advancedGradient']>) => void

    setLiquidMetal: (partial: Partial<State['liquidMetal']>) => void
    setFlowGradient: (partial: Partial<State['flowGradient']>) => void
    setCubicGlass: (config: Partial<State['cubicGlass']>) => void
    setLogo: (logo: string | null) => void
    setAppState: (state: 'intro' | 'animating' | 'ready') => void
    applyPreset: (name: string) => void
    randomizeColors: () => void
}


export const useStore = create<State>((set) => {
    // URL Hydration Logic
    const params = new URLSearchParams(window.location.search)
    const getParam = (key: string, defaultVal: any) => {
        const val = params.get(key)
        if (val === null) return defaultVal
        if (typeof defaultVal === 'number') return parseFloat(val)
        if (typeof defaultVal === 'boolean') return val === 'true'
        return val // String (colors)
    }

    // Check for 'embed' mode implies we skip intro? 
    // Actually appState handles intro. If embed=true, we might want 'ready' immediately.
    // We'll handle that in appState init.

    // Generic Helper to hydrate colors/speed based on common keys
    const c1 = getParam('c1', null);
    const c2 = getParam('c2', null);
    const c3 = getParam('c3', null);
    const c4 = getParam('c4', null);
    const spd = getParam('spd', null);

    // Determine active mode from URL (default 'Acid Trip')
    const urlMode = getParam('mode', 'Acid Trip');

    return {
        gradient: {
            ...PRESETS['Neon'],
            // Only hydrate if we are really targeting this (legacy support)
            color1: getParam('c1', PRESETS['Neon'].color1),
            color2: getParam('c2', PRESETS['Neon'].color2),
            color3: getParam('c3', PRESETS['Neon'].color3),
            color4: getParam('c4', PRESETS['Neon'].color4),
            speed: getParam('spd', PRESETS['Neon'].speed),
            noiseDensity: getParam('den', PRESETS['Neon'].noiseDensity),
            noiseStrength: getParam('str', PRESETS['Neon'].noiseStrength),
            wireframe: getParam('wire', false),
            kaleidoscope: getParam('kal', false),
            kSegments: getParam('seg', 6),
            loop: getParam('loop', false)
        },
        glass: {
            enabled: true,
            transmission: 1.0,
            thickness: 0.50,
            roughness: 0.39,
            chromaticAberration: 0.05,
            fluteScale: 1.00,
            patternType: 'Linear',
            ridgeProfile: 'Round',
            segments: 6,
            rippleDensity: 21.00,
            waviness: 0,
            waveFreq: 5.8,
            animate: true,
            patternRotation: 45.00,
            flowSpeed: 0.20,
            flowDirection: 135,
            curvature: 0.00
        },

        ripples: {
            color: c1 || '#0081f7',
            speed: spd || 0.2,
            cellDensity: 120, // Finer grid by default
            spread: 0.15,
            backgroundColor: '#000000',
            effectType: 'Expand'
        },
        lava: {
            color1: c1 || '#ff0055',
            color2: c2 || '#ffff00',
            color3: c3 || '#00ccff',
            background: '#0a0a0a',
            speed: spd || 0.3,
            threshold: 1.0
        },
        blob: {
            blob1: { color: c1 || '#8db39a', size: 0.44, offsetX: 0, offsetY: 0 },
            blob2: { color: c2 || '#ebff94', size: 0.26, offsetX: 0, offsetY: 0 },
            background: { color: c3 || '#79ba59' },
            noise: 0.05,
            direction: 'Left-to-Right',
            animation: {
                enabled: false,
                type: 'Pulse',
                speed: 1.0
            }
        },
        glow: {
            color1: c1 || '#4facfe',
            color2: c2 || '#f093fb',
            radius1: 1.65,
            radius2: 1.03,
            intensity: 1.20,
            pulseSpeed: 2.76,
            pos1: { x: 0.28, y: 0.73 },
            pos2: { x: 0.31, y: 0.45 }
        },
        orbs: {
            color1: c1 || '#4f46e5',
            color2: c2 || '#7c3aed',
            color3: c3 || '#06b6d4',
            color4: c4 || '#8b5cf6',
            speed: spd || 0.3,
            blur: 0.4,
            scale: 1.0
        },

        fluid: {
            color1: c1 || '#38bdf8',
            color2: c2 || '#e879f9',
            color3: c3 || '#34d399',
            color4: c4 || '#fbbf24',
            background: '#0f172a',
            speed: spd || 0.2,
            density: 0.7,
            strength: 0.4,
            smoothing: 0.5,
            complexity: 1.0
        },
        postfx: {
            dither: true,
            ditherOpacity: 0.76,
            grain: 0.0, // New Global Static Grain (Default 0, User request)
            bloom: true,
            bloomIntensity: 0.76,
            bloomThreshold: 0.20,
            bloomSmoothing: 0.9,
            crt: false,
            scanlines: 0.5,
            crtAberration: 0.005,
            vignette: 0.5,
            film: false,
            filmSepia: 0.5,
            filmScratches: 0.5,
            filmDirt: 0.5
        },
        scene: {
            bgMode: urlMode,
            solidColor: '#012265'
        },
        advancedGradient: {
            stops: [
                { id: '1', color: '#012265', pos: 0.0, opacity: 1.0 }, // Deep Blue
                { id: '2', color: '#00f2fe', pos: 1.0, opacity: 1.0 }  // Cyan
            ],
            angle: 135,
            animation: 'Flow',
            speed: 0.2,
            roughness: 0
        },
        liquidMetal: {
            colors: (c1 && c2 && c3) ? [c1, c2, c3, c4 || '#ffffff'] : ['#ffffff', '#ffafaf', '#0099ff', '#aaffff'],
            metalness: 0.5,
            roughness: 0.5,
            speed: spd || 0.2,
            distortion: 1.5
        },
        cubicGlass: {
            colors: (c1 && c2 && c3) ? [c1, c2, c3] : ['#ff00ea', '#ffce00', '#00e5ff'],
            gridSize: 30,
            speed: spd || 0.5,
            smoothness: 0.2
        },
        flowGradient: {
            color1: c1 || '#a960ee',
            color2: c2 || '#ff333d',
            color3: c3 || '#90e0ff',
            color4: c4 || '#ffcb57',
            speed: spd || 0.15,
            noiseFreq: { x: 14e-5, y: 29e-5 }, // From reference
            noiseAmp: 320,
            density: 0.08,
            grain: 0.0 // Default 0 (Off) until user adjusts
        },
        logo: null,
        appState: new URLSearchParams(window.location.search).get('embed') === 'true' ? 'ready' : 'intro',

        // Actions
        setGradient: (partial) => set((state) => ({ gradient: { ...state.gradient, ...partial } })),
        setGlass: (partial) => set((state) => ({ glass: { ...state.glass, ...partial } })),
        setLava: (partial) => set((state) => ({ lava: { ...state.lava, ...partial } })),
        setBlob: (partial) => set((state) => ({ blob: { ...state.blob, ...partial } })),
        setGlow: (partial) => set((state) => ({ glow: { ...state.glow, ...partial } })),
        setAdvancedGradient: (partial) => set((state) => ({ advancedGradient: { ...state.advancedGradient, ...partial } })),
        setLiquidMetal: (partial: Partial<State['liquidMetal']>) => set((state) => ({ liquidMetal: { ...state.liquidMetal, ...partial } })),
        setOrbs: (partial) => set((state) => ({ orbs: { ...state.orbs, ...partial } })),
        setFluid: (partial) => set((state) => ({ fluid: { ...state.fluid, ...partial } })),
        setRipples: (partial) => set((state) => ({ ripples: { ...state.ripples, ...partial } })),

        setCubicGlass: (partial) => set((state) => ({ cubicGlass: { ...state.cubicGlass, ...partial } })),
        setFlowGradient: (partial) => set((state) => ({ flowGradient: { ...state.flowGradient, ...partial } })),
        // Ripples tasks restored:
        // - [x] Implement "Ripples" Mode (Halftone/Squares)
        // - [x] Restore Ring Expansion for Ripples
        // - [x] Update Ripples Controls (Density, Bg Color)
        setPostFX: (partial) => set((state) => ({ postfx: { ...state.postfx, ...partial } })),
        setScene: (partial) => set((state) => ({ scene: { ...state.scene, ...partial } })),
        setLogo: (logo) => set({ logo }),
        setAppState: (appState) => set({ appState }),

        applyPreset: (name) => {
            const p = PRESETS[name as keyof typeof PRESETS]
            if (p) {
                set((state) => ({ gradient: { ...state.gradient, ...p } }))
            }
        },
        randomizeColors: () => {
            const p = TRENDY_PALETTES[Math.floor(Math.random() * TRENDY_PALETTES.length)]
            set((state) => {
                const mode = state.scene.bgMode
                if (mode === 'Gradient') {
                    return { gradient: { ...state.gradient, color1: p[0], color2: p[1], color3: p[2], color4: p[3] } }
                } else if (mode === 'Lava Lamp') {
                    return { lava: { ...state.lava, color1: p[0], color2: p[1], color3: p[2] } }
                } else if (mode === 'Blob Stack') {
                    return { blob: { ...state.blob, blob1: { ...state.blob.blob1, color: p[0] }, blob2: { ...state.blob.blob2, color: p[1] }, background: { color: p[2] } } }
                } else if (mode === 'Orbs') {
                    return { orbs: { ...state.orbs, color1: p[0], color2: p[1], color3: p[2], color4: p[3] } }
                } else if (mode === 'Solid + Glow') {
                    return { glow: { ...state.glow, color1: p[0], color2: p[1] } }
                } else if (mode === 'Acid Trip') {
                    return { fluid: { ...state.fluid, color1: p[0], color2: p[1], color3: p[2], color4: p[3] } }
                } else if (mode === 'Flow Gradient') {
                    return { flowGradient: { ...state.flowGradient, color1: p[0], color2: p[1], color3: p[2], color4: p[3] } }
                }
                return {}
            })
        }
    }
})
