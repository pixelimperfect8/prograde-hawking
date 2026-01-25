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
                background: appState === 'animating' ? 'rgba(0,0,0,0)' : 'transparent', // fade out hack if needed
                transition: 'background 0.5s',
                pointerEvents: 'auto' // FORCE EVENTS ON
            }}
        >
            <div className={`glitch-wrapper ${appState === 'animating' ? 'glitch-melt' : ''}`}>
                <h1
                    className="glitch-text"
                    onClick={handleClick}
                    data-text="MESHIT"
                >
                    MESHIT
                </h1>
            </div>

            <style>{`
                /* Container to center and handle global transforms */
                .glitch-wrapper {
                    position: relative;
                }

                .glitch-text {
                    margin: 0;
                    font-family: 'Inter', sans-serif;
                    font-weight: 900;
                    font-size: clamp(4rem, 7.2vw, 13rem);
                    letter-spacing: -0.04em;
                    line-height: 0.85;
                    color: #FBFF00;
                    mix-blend-mode: overlay;
                    position: relative;
                    cursor: pointer;
                    user-select: none;
                }

                /* Pseudo-elements for the glitch layers */
                .glitch-text::before,
                .glitch-text::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: transparent; /* No bg, just text */
                    opacity: 0.8;
                }

                /* Red Shift Layer */
                .glitch-text::before {
                    color: #FF0055;
                    z-index: -1;
                    clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
                    transform: translate(-2px, 2px);
                    opacity: 0; /* Hidden by default */
                }

                /* Cyan Shift Layer */
                .glitch-text::after {
                    color: #00FFFF;
                    z-index: -2;
                    clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
                    transform: translate(2px, -2px);
                    opacity: 0; /* Hidden by default */
                }

                /* HOVER EFFECT: Rapid Glitching */
                .glitch-text:hover::before {
                    opacity: 1;
                    animation: glitch-anim-1 0.4s infinite linear alternate-reverse;
                }
                .glitch-text:hover::after {
                    opacity: 1;
                    animation: glitch-anim-2 0.4s infinite linear alternate-reverse;
                }
                .glitch-text:hover {
                    animation: glitch-shake 0.4s infinite;
                }

                /* MELTDOWN EFFECT: Click Animation */
                .glitch-melt .glitch-text {
                    animation: melt-exit 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards;
                }
                .glitch-melt .glitch-text::before {
                    opacity: 1;
                    animation: glitch-anim-1 0.1s infinite linear, melt-spread 0.8s forwards;
                }
                .glitch-melt .glitch-text::after {
                    opacity: 1;
                    animation: glitch-anim-2 0.1s infinite linear, melt-spread 0.8s reverse forwards;
                }

                /* KEYFRAMES */

                /* Random Clip Slices 1 */
                @keyframes glitch-anim-1 {
                    0% { clip-path: inset(20% 0 80% 0); transform: translate(-3px, 1px); }
                    20% { clip-path: inset(60% 0 10% 0); transform: translate(3px, -1px); }
                    40% { clip-path: inset(40% 0 50% 0); transform: translate(-3px, 2px); }
                    60% { clip-path: inset(80% 0 5% 0); transform: translate(3px, -2px); }
                    80% { clip-path: inset(10% 0 60% 0); transform: translate(-1px, 2px); }
                    100% { clip-path: inset(30% 0 20% 0); transform: translate(2px, -1px); }
                }

                /* Random Clip Slices 2 */
                @keyframes glitch-anim-2 {
                    0% { clip-path: inset(10% 0 60% 0); transform: translate(3px, -1px); }
                    20% { clip-path: inset(30% 0 20% 0); transform: translate(-3px, 2px); }
                    40% { clip-path: inset(10% 0 80% 0); transform: translate(3px, 1px); }
                    60% { clip-path: inset(50% 0 30% 0); transform: translate(-3px, -2px); }
                    80% { clip-path: inset(70% 0 10% 0); transform: translate(1px, -1px); }
                    100% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 2px); }
                }

                /* Shake Main Text */
                @keyframes glitch-shake {
                    0% { transform: translate(1px, 1px); }
                    25% { transform: translate(-1px, -1px); }
                    50% { transform: translate(-2px, 0); }
                    75% { transform: translate(2px, 0); }
                    100% { transform: translate(1px, -1px); }
                }

                /* Final Meltdown & Disappear */
                @keyframes melt-exit {
                    0% { transform: scale(1); filter: blur(0px); opacity: 1; }
                    20% { transform: scale(1.1, 0.8) skew(10deg); filter: blur(2px); opacity: 1; }
                    50% { transform: scale(0.5, 3) skew(-20deg); filter: blur(10px); opacity: 0.8; }
                    100% { transform: scale(0, 10); filter: blur(20px); opacity: 0; }
                }

                @keyframes melt-spread {
                    0% { transform: translate(0); }
                    100% { transform: translate(50px, 0) scale(2); }
                }
            `}</style>
        </div>
    )
}
