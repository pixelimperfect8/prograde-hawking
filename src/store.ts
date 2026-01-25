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
        logo: string | null
    }
    setGradient: (partial: Partial<State['gradient']>) => void
    setGlass: (partial: Partial<State['glass']>) => void
    setPostFX: (partial: Partial<State['postfx']>) => void
    setLogo: (logo: string | null) => void
    applyPreset: (name: string) => void
    randomizeColors: () => void
}

export const useStore = create<State>((set) => ({
    gradient: {
        ...PRESETS['Neon'],
        wireframe: false,
        kaleidoscope: false,
        kSegments: 6
    },
    glass: {
        enabled: true,
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
        flowDirection: 135
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
        filmDirt: 0.5,
        logo: null
    },
    setGradient: (partial) => set((state) => ({ gradient: { ...state.gradient, ...partial } })),
    setGlass: (partial) => set((state) => ({ glass: { ...state.glass, ...partial } })),
    setPostFX: (partial) => set((state) => ({ postfx: { ...state.postfx, ...partial } })),
    setLogo: (logo) => set(() => ({ logo })),
    applyPreset: (name) => {
        const p = PRESETS[name as keyof typeof PRESETS]
        if (p) {
            set((state) => ({ gradient: { ...state.gradient, ...p } }))
        }
    },
    randomizeColors: () => {
        const p = TRENDY_PALETTES[Math.floor(Math.random() * TRENDY_PALETTES.length)]
        set((state) => ({
            gradient: {
                ...state.gradient,
                color1: p[0],
                color2: p[1],
                color3: p[2],
                color4: p[3]
            }
        }))
    }
}))
