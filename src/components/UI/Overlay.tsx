// import BrandingControl from './BrandingControl'
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
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center', // Centered horizontally based on Figma "justify-content: center"? Or maybe left aligned since it's a side panel?
                // The Figma said "justify-content: center" for the container, but "width: 337px". 
                // Usually side panels are on the side. I'll keep it left-aligned but allow the inner box to have the specific width.
            }}
        >
            <div style={{
                pointerEvents: 'auto',
                width: '337px',
                // height: '1838px', // Don't force height, let it grow
                maxHeight: '95vh',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '16px', // "padding: 0px" in Inner auto layout, but "padding: 16px" in Container.

                background: 'transparent',
                // backdropFilter: 'blur(72px)', // Moved to Section
                // WebkitBackdropFilter: 'blur(72px)',
                borderRadius: '0px',

                overflowY: 'auto',
            }}>
                {/* <BrandingControl /> */}
                <SceneControl />
                <GradientControl />
                <GlassControl />
                <EffectsControl />
            </div>
        </div>
    )
}
