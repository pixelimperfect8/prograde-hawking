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
    }
    // Scene Slice
    scene: {
        bgMode: 'Gradient' | 'Solid + Glow' | 'Lava Lamp' | 'Blob Stack' | 'Orbs' | 'Acid Trip' | 'Ripples'
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

    return {
        gradient: {
            ...PRESETS['Neon'],
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
            enabled: false,
            transmission: 1,
            thickness: 0.5,
            roughness: 0.1,
            chromaticAberration: 0.05,
            fluteScale: 1,
            patternType: 'Linear',
            ridgeProfile: 'Round',
            segments: 6,
            rippleDensity: 11,
            waviness: 0,
            waveFreq: 5.8,
            animate: true,
            patternRotation: 45,
            flowSpeed: 0.2,
            flowDirection: 135,
            curvature: 0
        },

        ripples: {
            color: '#0081f7',
            speed: 0.2,
            cellDensity: 120, // Finer grid by default
            spread: 0.15,
            backgroundColor: '#000000',
            effectType: 'Expand'
        },
        lava: {
            color1: '#ff0055',
            color2: '#ffff00',
            color3: '#00ccff',
            background: '#0a0a0a',
            speed: 0.3,
            threshold: 1.0
        },
        blob: {
            blob1: { color: '#8db39a', size: 0.44, offsetX: 0, offsetY: 0 },
            blob2: { color: '#ebff94', size: 0.26, offsetX: 0, offsetY: 0 },
            background: { color: '#79ba59' },
            noise: 0.05,
            direction: 'Left-to-Right',
            animation: {
                enabled: false,
                type: 'Pulse',
                speed: 1.0
            }
        },
        glow: {
            color1: '#4facfe',
            color2: '#f093fb',
            radius1: 0.8,
            radius2: 0.6,
            intensity: 1.2,
            pulseSpeed: 1.0,
            pos1: { x: 0.3, y: 0.7 },
            pos2: { x: 0.7, y: 0.3 }
        },
        orbs: {
            color1: '#4f46e5',
            color2: '#7c3aed',
            color3: '#06b6d4',
            color4: '#8b5cf6',
            speed: 0.3,
            blur: 0.4,
            scale: 1.0
        },

        fluid: {
            color1: '#38bdf8',
            color2: '#e879f9',
            color3: '#34d399',
            color4: '#fbbf24',
            background: '#0f172a',
            speed: 0.2,
            density: 0.7,
            strength: 0.4,
            smoothing: 0.5,
            complexity: 1.0
        },
        postfx: {
            dither: true,
            ditherOpacity: 0.5,
            bloom: true,
            bloomIntensity: 1.5,
            bloomThreshold: 0.2,
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
            bgMode: 'Acid Trip',
            solidColor: '#a3b48b'
        },
        logo: null,
        appState: new URLSearchParams(window.location.search).get('embed') === 'true' ? 'ready' : 'intro',

        // Actions
        setGradient: (partial) => set((state) => ({ gradient: { ...state.gradient, ...partial } })),
        setGlass: (partial) => set((state) => ({ glass: { ...state.glass, ...partial } })),
        setLava: (partial) => set((state) => ({ lava: { ...state.lava, ...partial } })),
        setBlob: (partial) => set((state) => ({ blob: { ...state.blob, ...partial } })),
        setGlow: (partial) => set((state) => ({ glow: { ...state.glow, ...partial } })),
        setOrbs: (partial) => set((state) => ({ orbs: { ...state.orbs, ...partial } })),
        setFluid: (partial) => set((state) => ({ fluid: { ...state.fluid, ...partial } })),
        setRipples: (partial) => set((state) => ({ ripples: { ...state.ripples, ...partial } })),
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
                }
                return {}
            })
        }
    }
})
