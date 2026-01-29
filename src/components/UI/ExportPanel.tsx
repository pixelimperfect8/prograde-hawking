import { useStore } from '../../store'
import { useState } from 'react'

interface ExportPanelProps {
    onClose: () => void
}

export default function ExportPanel({ onClose }: ExportPanelProps) {
    // 1. Read generic state
    const {
        scene,
        gradient,
        fluid,
        lava,
        orbs,
        glow,
        cubicGlass,
        liquidMetal,
        flowGradient,
        glass,
        ripples,
        blob,

    } = useStore()

    const [copied, setCopied] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'iframe' | 'framer' | 'webflow' | 'javascript'>('iframe')

    // Base URL for the app
    const baseUrl = 'https://prograde-hawking-tl51-git-master-ivans-projects-bf0d2689.vercel.app'
    const scriptUrl = `${baseUrl}/meshit.js`

    // Helper: Extract params based on active mode
    // We map specifics to generic 'c1', 'c2', 'spd' etc. that store.ts now respects
    const getModeParams = () => {
        const mode = scene.bgMode
        let params: any = { mode: mode } // ALWAYS include mode

        switch (mode) {
            case 'Gradient': // Neon Legacy
                params = { ...params, c1: gradient.color1, c2: gradient.color2, c3: gradient.color3, c4: gradient.color4, spd: gradient.speed, den: gradient.noiseDensity, str: gradient.noiseStrength }
                break
            case 'Acid Trip': // Fluid
                params = { ...params, c1: fluid.color1, c2: fluid.color2, c3: fluid.color3, c4: fluid.color4, spd: fluid.speed, den: fluid.density, str: fluid.strength }
                break
            case 'Lava Lamp':
                params = { ...params, c1: lava.color1, c2: lava.color2, c3: lava.color3, spd: lava.speed }
                break
            case 'Orbs':
                params = { ...params, c1: orbs.color1, c2: orbs.color2, c3: orbs.color3, c4: orbs.color4, spd: orbs.speed }
                break
            case 'Solid + Glow':
                params = { ...params, c1: glow.color1, c2: glow.color2 }
                break
            case 'Cubic': // Cubic Glass
                params = { ...params, c1: cubicGlass.colors[0], c2: cubicGlass.colors[1], c3: cubicGlass.colors[2], spd: cubicGlass.speed }
                break
            case 'Liquid Metal':
                params = { ...params, c1: liquidMetal.colors[0], c2: liquidMetal.colors[1], c3: liquidMetal.colors[2], c4: liquidMetal.colors[3], spd: liquidMetal.speed }
                break
            case 'Flow Gradient':
                params = { ...params, c1: flowGradient.color1, c2: flowGradient.color2, c3: flowGradient.color3, c4: flowGradient.color4, spd: flowGradient.speed }
                break
            case 'Ripples':
                params = { ...params, c1: ripples.color, spd: ripples.speed, den: ripples.cellDensity, str: ripples.spread }
                // Note: Ripples uses 'color' not c1, but hydration aligns c1 -> color1 usually. 
                // Store.ts: colors: '#0081f7' (single color). 
                // We'll map to c1. I need to update Store hydration for Ripples if I want deep linking to work perfectly for it.
                break
            case 'Blob Stack':
                params = { ...params, c1: blob.blob1.color, c2: blob.blob2.color, c3: blob.background.color }
                break
            case 'Linear Gradient': // Advanced
                // Advanced gradient is complex (array of stops). 
                // For now, we just map the start/end if simple, or skip params to force defaults.
                // Deep linking advanced gradient perfectly requires JSON param.
                // Fallback to defaults.
                break
            default:
                // Fallback to Acid/Gradient params if undefined
                params = { ...params, c1: gradient.color1, c2: gradient.color2, spd: gradient.speed }
        }
        return params
    }

    // Build URL params for iframe (includes ALL settings)
    const buildIframeUrl = () => {
        const params = new URLSearchParams()
        const modeParams = getModeParams()

        // Append all key/values from modeParams
        Object.entries(modeParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.set(key, value.toString())
            }
        })

        // Glass settings (always include transparency/glassiness if enabled)
        params.set('glass', glass.enabled.toString())

        // Embed mode
        params.set('embed', 'true')
        return `${baseUrl}/?${params.toString()}`
    }

    const iframeUrl = buildIframeUrl()

    // Iframe embed (includes ALL effects)
    const iframeCode = `<iframe 
  src="${iframeUrl}"
  style="width:100%; height:100%; min-height:400px; border:none; display:block;"
  allow="accelerometer; autoplay; encrypted-media; gyroscope"
></iframe>`

    // Build config JSON for meshit.js (Dynamic params)
    const config = JSON.stringify(getModeParams())

    // Simple JS embed (Dynamic)
    const javascriptCode = `<div data-meshit='${config}' style="width:100%; height:400px;"></div>
<script src="${scriptUrl}"></script>`

    const webflowCode = `<!-- Add this to your page's custom code (before </body>) -->
<script src="${scriptUrl}"></script>

<!-- Add this as an Embed element where you want the gradient -->
<div data-meshit='${config}' style="width:100%; height:100%;"></div>`

    // Framer iframe version (simpler, includes all effects)
    const framerCode = `export default function MeshitGradient(props) {
    return (
        <iframe
            src="${iframeUrl}"
            style={{
                width: "100%",
                height: "100%",
                minHeight: 400,
                border: "none",
                display: "block",
                ...props.style
            }}
            allow="accelerometer; autoplay; encrypted-media; gyroscope"
        />
    )
}`

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(label)
            setTimeout(() => setCopied(null), 2000)
        })
    }

    const tabStyle = (isActive: boolean) => ({
        flex: 1,
        padding: '8px 12px',
        background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
        border: 'none',
        borderBottom: isActive ? '2px solid #fff' : '2px solid transparent',
        color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        transition: 'all 0.2s'
    })

    const buttonStyle = {
        width: '100%',
        padding: '12px',
        marginBottom: '8px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px',
        color: '#fff',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s'
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'rgba(20,20,20,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                width: '480px',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '24px'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>Export Gradient</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            fontSize: '20px',
                            padding: '4px'
                        }}
                    >×</button>
                </div>

                {/* Quick Copy Buttons */}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        style={{ ...buttonStyle, background: 'rgba(138, 43, 226, 0.2)', border: '1px solid rgba(138, 43, 226, 0.4)' }}
                        onClick={() => copyToClipboard(iframeCode, 'iframe')}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(138, 43, 226, 0.2)'}
                    >
                        {copied === 'iframe' ? '✓ Copied!' : '🎨 Copy Iframe (Full Effects)'}
                    </button>
                    <button
                        style={buttonStyle}
                        onClick={() => copyToClipboard(framerCode, 'framer')}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        {copied === 'framer' ? '✓ Copied!' : '⚡ Copy to Framer'}
                    </button>
                    <button
                        style={buttonStyle}
                        onClick={() => copyToClipboard(webflowCode, 'webflow')}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        {copied === 'webflow' ? '✓ Copied!' : '🌐 Copy to Webflow'}
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                    <button style={tabStyle(activeTab === 'iframe')} onClick={() => setActiveTab('iframe')}>Iframe</button>
                    <button style={tabStyle(activeTab === 'framer')} onClick={() => setActiveTab('framer')}>Framer</button>
                    <button style={tabStyle(activeTab === 'webflow')} onClick={() => setActiveTab('webflow')}>Webflow</button>
                    <button style={tabStyle(activeTab === 'javascript')} onClick={() => setActiveTab('javascript')}>JS Only</button>
                </div>

                {/* Code Preview */}
                <pre style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: 'rgba(255,255,255,0.8)',
                    overflow: 'auto',
                    maxHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                }}>
                    {activeTab === 'iframe' && iframeCode}
                    {activeTab === 'framer' && framerCode}
                    {activeTab === 'webflow' && webflowCode}
                    {activeTab === 'javascript' && javascriptCode}
                </pre>

                {/* Instructions */}
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '16px', lineHeight: 1.5 }}>
                    {activeTab === 'framer' && 'In Framer: Assets → Code → New Code File → Paste'}
                    {activeTab === 'webflow' && 'In Webflow: Add Embed element → Paste the HTML'}
                    {activeTab === 'javascript' && 'Paste this code anywhere in your HTML'}
                </p>
            </div>
        </div>
    )
}
