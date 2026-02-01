
import { useStore } from '../../store'
import { useState, useRef } from 'react'

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
        intelligenceGlow,
        postfx // Ensure we read effects
    } = useStore()

    const [copied, setCopied] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'iframe' | 'framer' | 'webflow' | 'javascript' | 'video'>('iframe')

    // Video Recording State
    const {
        export: exportState,
        setExport
    } = useStore()

    // We keep local ref for the specific MediaRecorder instance
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    // Base URL for the app
    const baseUrl = 'https://prograde-hawking-tl51-git-master-ivans-projects-bf0d2689.vercel.app'
    const scriptUrl = `${baseUrl}/meshit.js`

    // Helper: Extract params based on active mode
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
                break
            case 'Blob Stack':
                params = { ...params, c1: blob.blob1.color, c2: blob.blob2.color, c3: blob.background.color }
                break
            case 'Intelligence Glow':
                params = { ...params, c1: intelligenceGlow.color1, c2: intelligenceGlow.color2, c3: intelligenceGlow.color3, c4: intelligenceGlow.color4, spd: intelligenceGlow.speed }
                break
            case 'Linear Gradient': // Advanced
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

        // Glass settings
        params.set('glass', glass.enabled.toString())

        // Effects (Grain)
        const activeGrain = (scene.bgMode === 'Flow Gradient' ? flowGradient.grain : postfx.grain) || 0
        if (activeGrain > 0) {
            params.set('grain', activeGrain.toString())
        }

        // Embed mode
        params.set('embed', 'true')
        return `${baseUrl}/?${params.toString()}`
    }

    const iframeUrl = buildIframeUrl()

    // Iframe embed
    const iframeCode = `<iframe 
  src="${iframeUrl}"
  style="width:100%; height:100%; min-height:400px; border:none; display:block;"
  allow="accelerometer; autoplay; encrypted-media; gyroscope"
></iframe>`

    // Build config JSON
    const config = JSON.stringify({
        ...getModeParams(),
        glass: glass.enabled,
        grain: (scene.bgMode === 'Flow Gradient' ? flowGradient.grain : postfx.grain) || 0
    })

    // Video Recording Logic
    const startRecording = async () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        // 1. Set global recording state to Trigger Resize in App.tsx
        setExport({ isRecording: true })

        // 2. Wait a tick for Resize to apply if strictly needed?
        // In React, the resize in App.tsx will happen, but MediaRecorder needs the stream immediately.
        // Actually, capturing the stream *after* resize is safer.
        await new Promise(r => setTimeout(r, 200)) // Short delay for React render

        try {
            // Capture at 60 FPS
            const stream = canvas.captureStream(60);

            // Determine Bitrate (Massively increased for complex gradients)
            let bitrate = 15000000; // 15 Mbps (High)
            if (exportState.quality === 'ultra') bitrate = 50000000; // 50 Mbps
            if (exportState.quality === 'lossless') bitrate = 500000000; // 500 Mbps (Insane)

            // Preferred Codecs (VP9 -> H264 -> VP8)
            const mimeTypes = [
                'video/webm;codecs=vp9',
                'video/webm;codecs=h264', // Chrome might support this hardware acc.
                'video/webm;codecs=vp8',
                'video/webm'
            ];

            let options = { mimeType: 'video/webm', videoBitsPerSecond: bitrate } as any;

            for (const type of mimeTypes) {
                if (MediaRecorder.isTypeSupported(type)) {
                    options = { mimeType: type, videoBitsPerSecond: bitrate };
                    console.log(`Using MimeType: ${type}`);
                    break;
                }
            }

            const recorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                chunksRef.current = [];

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `meshit-export-${exportState.resolution}-${exportState.quality}-${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();

                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);

                // Reset State
                setExport({ isRecording: false })
            };

            recorder.start();
        } catch (err) {
            console.error(err);
            setExport({ isRecording: false })
            alert('Failed to start recording.');
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && exportState.isRecording) {
            mediaRecorderRef.current.stop();
            // isRecording set to false in onstop
        }
    }

    // Embed strings...
    const javascriptCode = `<div data-meshit='${config}' style="width:100%; height:400px;"></div>
<script src="${scriptUrl}"></script>`

    const webflowCode = `<!-- Add this before </body> -->
<script src="${scriptUrl}"></script>

<!-- Add this embed -->
<div data-meshit='${config}' style="width:100%; height:100%;"></div>`

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
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
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
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>Export</h2>
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

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                    <button style={tabStyle(activeTab === 'iframe')} onClick={() => setActiveTab('iframe')}>Iframe</button>
                    <button style={tabStyle(activeTab === 'video')} onClick={() => setActiveTab('video')}>Video</button>
                    <button style={tabStyle(activeTab === 'framer')} onClick={() => setActiveTab('framer')}>Framer</button>
                    <button style={tabStyle(activeTab === 'javascript')} onClick={() => setActiveTab('javascript')}>JS</button>
                </div>

                {/* Content */}
                {activeTab === 'video' ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '16px', fontSize: '12px', color: '#aaa', lineHeight: 1.5 }}>
                            Records a high-quality <strong>WebM</strong> video of the current animation.<br />
                            The screen might resize during recording if a specific resolution is selected.
                        </div>

                        {/* Export Options */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            {/* Resolution */}
                            <label style={{ display: 'block', textAlign: 'left' }}>
                                <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Resolution</span>
                                <select
                                    value={exportState.resolution}
                                    onChange={(e) => setExport({ resolution: e.target.value as any })}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                >
                                    <option value="window">Window Size</option>
                                    <option value="1080p">1080p (FHD)</option>
                                    <option value="4k">4K (UHD)</option>
                                </select>
                            </label>

                            {/* Quality */}
                            <label style={{ display: 'block', textAlign: 'left' }}>
                                <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Quality (Bitrate)</span>
                                <select
                                    value={exportState.quality}
                                    onChange={(e) => setExport({ quality: e.target.value as any })}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                                >
                                    <option value="high">High (8 Mbps)</option>
                                    <option value="ultra">Ultra (30 Mbps)</option>
                                    <option value="lossless">Lossless (100 Mbps)</option>
                                </select>
                            </label>
                        </div>

                        {!exportState.isRecording ? (
                            <button
                                onClick={startRecording}
                                style={{
                                    ...buttonStyle,
                                    background: '#ef4444',
                                    border: '1px solid #dc2626',
                                    padding: '16px',
                                    fontSize: '14px',
                                    fontWeight: 600
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                            >
                                <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%' }} />
                                Start Recording
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                style={{
                                    ...buttonStyle,
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '16px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    animation: 'pulse 1.5s infinite'
                                }}
                            >
                                <div style={{ width: '10px', height: '10px', background: 'red', borderRadius: '2px' }} />
                                Stop Recording...
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Quick Copy Buttons for Code */}
                        <div style={{ marginBottom: '20px' }}>
                            {activeTab === 'iframe' && (
                                <button
                                    style={{ ...buttonStyle, background: 'rgba(138, 43, 226, 0.2)', border: '1px solid rgba(138, 43, 226, 0.4)' }}
                                    onClick={() => copyToClipboard(iframeCode, 'iframe')}
                                >
                                    {copied === 'iframe' ? '✓ Copied!' : '🎨 Copy Iframe Code'}
                                </button>
                            )}
                            {/* Other buttons specific to tab could act here */}
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
                    </>
                )}
            </div>
            <style>{`
                @keyframes pulse {
                    0% { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { border-color: rgba(239, 68, 68, 0); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { border-color: rgba(239, 68, 68, 0); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
        </div>
    )
}
