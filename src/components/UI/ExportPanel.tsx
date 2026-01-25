import { useStore } from '../../store'
import { useState } from 'react'

interface ExportPanelProps {
    onClose: () => void
}

export default function ExportPanel({ onClose }: ExportPanelProps) {
    const { gradient } = useStore()
    const [copied, setCopied] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'framer' | 'webflow' | 'javascript'>('javascript')

    // Base URL for the script - use production URL
    const baseUrl = 'https://prograde-hawking.vercel.app'
    const scriptUrl = `${baseUrl}/meshit.js`

    // Build config JSON
    const config = JSON.stringify({
        c1: gradient.color1,
        c2: gradient.color2,
        c3: gradient.color3,
        c4: gradient.color4,
        speed: gradient.speed,
        density: gradient.noiseDensity,
        strength: gradient.noiseStrength
    })

    // Embed codes for different platforms
    const javascriptCode = `<div data-meshit='${config}' style="width:100%; height:400px;"></div>
<script src="${scriptUrl}"></script>`

    const webflowCode = `<!-- Add this to your page's custom code (before </body>) -->
<script src="${scriptUrl}"></script>

<!-- Add this as an Embed element where you want the gradient -->
<div data-meshit='${config}' style="width:100%; height:100%;"></div>`

    const framerCode = `import * as React from "react"
import { useEffect, useRef } from "react"

export default function MeshitGradient() {
    const containerRef = useRef(null)
    
    useEffect(() => {
        const script = document.createElement('script')
        script.src = "${scriptUrl}"
        script.onload = () => {
            if (window.Meshit && containerRef.current) {
                window.Meshit.render(containerRef.current, ${config})
            }
        }
        document.body.appendChild(script)
        return () => script.remove()
    }, [])
    
    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
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
                    <button
                        style={buttonStyle}
                        onClick={() => copyToClipboard(javascriptCode, 'js')}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        {copied === 'js' ? '✓ Copied!' : '</> Copy JavaScript'}
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                    <button style={tabStyle(activeTab === 'framer')} onClick={() => setActiveTab('framer')}>Framer</button>
                    <button style={tabStyle(activeTab === 'webflow')} onClick={() => setActiveTab('webflow')}>Webflow</button>
                    <button style={tabStyle(activeTab === 'javascript')} onClick={() => setActiveTab('javascript')}>JavaScript</button>
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
