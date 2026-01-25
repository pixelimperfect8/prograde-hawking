export default function Ticker() {
    // Pattern: 5 "GENERATE"s followed by 1 "MORE"
    const chunk = "GENERATE ".repeat(5) + "MORE "
    // Repeat the chunk enough times to cover screen width
    const text = chunk.repeat(10)

    return (
        <>
            <style>
                {`
          @keyframes ticker-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); } 
          }
        `}
            </style>
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                overflow: 'hidden',
                zIndex: 5,
                padding: '10px 0',
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
                display: 'flex',
            }}>
                <div style={{
                    display: 'flex',
                    whiteSpace: 'nowrap',
                    // Keyframe is embedded above. 
                    // 0% -> -50% move. 
                    // Since we have 2 copies of identical content, -50% shifts exactly one copy's width.
                    // This creates a seamless loop.
                    animation: 'ticker-scroll 45s linear infinite',
                    width: 'max-content',
                    willChange: 'transform'
                }}>
                    <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '3rem',
                        fontWeight: 900,
                        color: '#FBFF00',
                        letterSpacing: '-0.02em',
                        paddingRight: '16px',
                        display: 'inline-block',
                        transform: 'scaleY(1.3)', // Match Intro Style
                        transformOrigin: 'bottom'
                    }}>
                        {text}
                    </span>

                    <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '3rem',
                        fontWeight: 900,
                        color: '#FBFF00',
                        letterSpacing: '-0.02em',
                        paddingRight: '16px',
                        display: 'inline-block',
                        transform: 'scaleY(1.3)',
                        transformOrigin: 'bottom'
                    }}>
                        {text}
                    </span>
                </div>
            </div>
        </>
    )
}
