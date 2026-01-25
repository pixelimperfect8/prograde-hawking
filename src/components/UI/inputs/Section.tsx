import { useState } from 'react'
import type { ReactNode } from 'react'

export default function Section({ title, children, defaultOpen = true }: { title: string, children: ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div style={{
            marginBottom: '10px',
            width: '100%',
            overflow: 'visible', // Allow dropdowns or shadows? User said clipping. 
            // Usually 'hidden' clips content. If padding is large, content might be pushed out.
            // But width 100% of 337px is 337px. Padding 32px * 2 = 64px. Content = 273px.
            boxSizing: 'border-box', // CRITICAL for padding
            // Card Style
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(72px)',
            WebkitBackdropFilter: 'blur(72px)',
            borderRadius: '8px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0px'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0px',
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'pointer',
                    textAlign: 'left',
                }}
            >
                <span>{title}</span>
                {isOpen ?
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 14L12 9L17 14" stroke="#FBFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> :
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 10L12 15L17 10" stroke="#FBFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                }
            </button>

            {
                isOpen && (
                    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {children}
                    </div>
                )
            }
        </div>
    )
}
