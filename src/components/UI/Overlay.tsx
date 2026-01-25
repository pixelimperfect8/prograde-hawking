import { useStore } from '../../store'
import SceneControl from './SceneControl'
import GradientControl from './GradientControl'
import GlassControl from './GlassControl'
import EffectsControl from './EffectsControl'
import LavaControl from './LavaControl'
import BlobControl from './BlobControl'
import GlowControl from './GlowControl'

export default function Overlay() {
    const { scene } = useStore()
    const { bgMode } = scene

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '320px', // Slick standard width
                height: '100vh',
                zIndex: 100,

                // The "Glass" Background
                background: 'rgba(5, 5, 5, 0.65)',
                backdropFilter: 'blur(50px)',
                WebkitBackdropFilter: 'blur(50px)',

                // The "Fade Away" Mask
                maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',

                display: 'flex',
                flexDirection: 'column',

                // Border/Separation
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
        >
            <div style={{
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                paddingBottom: '120px', // Space for fade
                height: '100%',
                scrollbarWidth: 'thin', // Firefox
                scrollbarColor: 'rgba(255,255,255,0.15) transparent', // Firefox
                scrollBehavior: 'smooth' // Smooth scroll
            }}>
                {/* <BrandingControl /> */}
                <SceneControl />

                {/* Dynamic Controls based on Background Mode */}
                {bgMode === 'Gradient' && <GradientControl />}
                {bgMode === 'Lava Lamp' && <LavaControl />}
                {bgMode === 'Blob Stack' && <BlobControl />}
                {bgMode === 'Solid + Glow' && <GlowControl />}

                <GlassControl />
                <EffectsControl />
            </div>
        </div>
    )
}
