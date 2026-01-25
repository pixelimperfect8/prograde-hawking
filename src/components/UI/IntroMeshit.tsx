import { useStore } from '../../store'

export default function IntroMeshit() {
    const { appState, setAppState } = useStore()

    const handleClick = () => {
        if (appState !== 'intro') return
        setAppState('animating')

        // 1s animation, then ready
        setTimeout(() => {
            setAppState('ready')
        }, 800)
    }

    if (appState === 'ready') return null

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 50,
                pointerEvents: 'auto',
                background: appState === 'animating' ? 'rgba(0,0,0,0)' : 'transparent',
                transition: 'background 0.5s'
            }}
        >
            {/* SVG Filter Definition */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="mesh-distort">
                        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.002" numOctaves="1" result="warp" />
                        <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="30" in="SourceGraphic" in2="warp" />
                    </filter>
                    <filter id="mesh-noise">
                        <feTurbulence type="turbulence" baseFrequency="0.5" numOctaves="2" result="noise" />
                        <feColorMatrix type="saturate" values="0" />
                        <feBlend mode="multiply" in="SourceGraphic" />
                    </filter>
                </defs>
            </svg>

            <div className={`cyber-wrapper ${appState === 'animating' ? 'cyber-melt' : ''}`}>
                <h1
                    className="cyber-text"
                    onClick={handleClick}
                    data-text="MESHIT"
                >
                    MESHIT
                </h1>
                <div className="scanlines"></div>
            </div>

            <style>{`
                /* Container */
                .cyber-wrapper {
                    position: relative;
                    /* Base Subtle Distortion */
                    filter: url(#mesh-distort); 
                }

                .cyber-text {
                    margin: 0;
                    font-family: 'Inter', sans-serif;
                    font-weight: 900;
                    font-size: clamp(4rem, 7.2vw, 13rem);
                    letter-spacing: -0.04em;
                    line-height: 0.85;
                    color: #FBFF00;
                    position: relative;
                    cursor: pointer;
                    user-select: none;
                    mix-blend-mode: hard-light;
                }

                /* Layers for RGB Split */
                .cyber-text::before,
                .cyber-text::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #111; /* Mask background for 'cutout' feel */
                    mix-blend-mode: exclusion;
                    opacity: 0.8;
                }

                /* Red Layer */
                .cyber-text::before {
                    color: red;
                    z-index: -1;
                    transform: translate(-3px, 0);
                    opacity: 0;
                }

                /* Cyan Layer */
                .cyber-text::after {
                    color: cyan;
                    z-index: -2;
                    transform: translate(3px, 0);
                    opacity: 0;
                }

                /* Scanlines Overlay */
                .scanlines {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        to bottom,
                        transparent 50%,
                        rgba(0, 0, 0, 0.4) 51%
                    );
                    background-size: 100% 4px;
                    pointer-events: none;
                    opacity: 0;
                }

                /* HOVER: Chaos Mode */
                .cyber-text:hover {
                    animation: cyber-shake 0.2s infinite;
                    filter: brightness(1.2) contrast(1.2);
                }
                .cyber-text:hover::before {
                    opacity: 1;
                    animation: rgb-shift-1 0.1s infinite steps(2);
                }
                .cyber-text:hover::after {
                    opacity: 1;
                    animation: rgb-shift-2 0.1s infinite steps(2);
                }
                .cyber-wrapper:hover .scanlines {
                    opacity: 0.3;
                }

                /* MELTDOWN CLICK */
                .cyber-melt .cyber-text {
                    animation: vertical-collapse 0.6s cubic-bezier(0.8, 0, 0.2, 1) forwards;
                }
                .cyber-melt .scanlines {
                    opacity: 0.8;
                    animation: scanline-flash 0.2s forwards;
                }

                /* ANIMATIONS */
                @keyframes cyber-shake {
                    0% { transform: translate(1px, 1px) skew(0deg); }
                    25% { transform: translate(-1px, -1px) skew(2deg); }
                    50% { transform: translate(-2px, 0) skew(-1deg); }
                    75% { transform: translate(2px, 0) skew(1deg); }
                    100% { transform: translate(1px, -1px) skew(0deg); }
                }

                @keyframes rgb-shift-1 {
                    0% { transform: translate(-4px, 2px); clip-path: inset(10% 0 10% 0); }
                    50% { transform: translate(-6px, -2px); clip-path: inset(50% 0 30% 0); }
                    100% { transform: translate(-2px, 4px); clip-path: inset(20% 0 60% 0); }
                }

                @keyframes rgb-shift-2 {
                    0% { transform: translate(4px, -2px); clip-path: inset(80% 0 5% 0); }
                    50% { transform: translate(6px, 2px); clip-path: inset(10% 0 70% 0); }
                    100% { transform: translate(2px, -4px); clip-path: inset(5% 0 80% 0); }
                }

                @keyframes vertical-collapse {
                    0% { 
                        transform: scaleY(1); 
                        filter: blur(0) contrast(1);
                    }
                    30% {
                        transform: scaleY(1.5) scaleX(0.9);
                        filter: blur(2px) contrast(2) hue-rotate(90deg);
                    }
                    100% { 
                        transform: scaleY(0.01) scaleX(2); 
                        opacity: 0;
                        filter: blur(10px) contrast(5);
                    }
                }

                @keyframes scanline-flash {
                    0% { background-color: transparent; }
                    50% { background-color: rgba(255, 255, 255, 0.2); }
                    100% { background-color: transparent; }
                }
            `}</style>
        </div>
    )
}
