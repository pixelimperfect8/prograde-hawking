import { useRef } from 'react'
import { useStore } from '../../store'

export default function BrandingControl() {
    const { logo, setLogo } = useStore()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    setLogo(event.target.result as string)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div style={{
            padding: '24px',
            background: 'rgba(20, 20, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '280px',
            color: 'white',
            fontFamily: '"Inter", sans-serif',
            boxShadow: '0 4px 32px rgba(0,0,0,0.4)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#DDD' }}>
                    BRANDING
                </h3>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: logo ? '#4facfe' : '#444' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="glass-btn"
                    style={{
                        padding: '10px',
                        fontSize: '0.85rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                    }}
                >
                    {logo ? 'Replace Logo' : 'Upload Logo'}
                </button>

                {logo && (
                    <button
                        onClick={() => {
                            setLogo(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        style={{
                            padding: '10px',
                            fontSize: '0.8rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Remove Logo
                    </button>
                )}
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/png, image/jpeg, image/svg+xml"
                style={{ display: 'none' }}
            />
        </div>
    )
}
