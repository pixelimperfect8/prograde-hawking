export default function BrandLogo() {
    return (
        <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            zIndex: 1000,
            pointerEvents: 'none',
            // mixBlendMode: 'overlay', // Removed for visibility
            userSelect: 'none'
        }}>
            <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '3rem',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                display: 'inline-block',
                transform: 'scaleY(1.3)', // Match Intro/Ticker Style
                transformOrigin: 'bottom left'
            }}>
                MESHIT
            </span>
        </div>
    )
}
