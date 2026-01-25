import BrandingControl from './BrandingControl'
import SceneControl from './SceneControl'
import GradientControl from './GradientControl'
import GlassControl from './GlassControl'
import EffectsControl from './EffectsControl'

export default function Overlay() {
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '12px',
                overflowY: 'auto' // Allow scrolling if controls get too tall
            }}
        >
            <div style={{ pointerEvents: 'auto', width: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <BrandingControl />
                <SceneControl />
                <GradientControl />
                <GlassControl />
                <EffectsControl />
            </div>
        </div>
    )
}
