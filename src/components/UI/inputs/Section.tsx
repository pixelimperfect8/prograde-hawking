import type { ReactNode } from 'react'

export default function Section({ title, children, isFirst = false }: { title?: string, children: ReactNode, isFirst?: boolean }) {
    return (
        <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: '24px', // Symmetric bottom spacing
            paddingTop: isFirst ? 0 : '24px', // Space below border for title
            borderTop: isFirst ? 'none' : '1px solid rgba(255, 255, 255, 0.1)' // Divider is now at the top
        }}>
            {title && (
                <div style={{
                    color: '#888',
                    fontSize: '0.7rem',
                    fontWeight: 400,
                    fontFamily: 'Inter, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                }}>
                    {title}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {children}
            </div>
        </div>
    )
}
