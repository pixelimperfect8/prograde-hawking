import BrandingControl from './BrandingControl'

export default function Overlay() {
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // Allow clicks to pass through to canvas
                zIndex: 10,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start', // Place controls on the left
            }}
        >
            <div style={{ pointerEvents: 'auto' }}>
                <BrandingControl />
            </div>

            {/* Placeholder for future controls */}
            {/* <div style={{ marginTop: '20px', pointerEvents: 'auto' }}><PresetsControl /></div> */}
        </div>
    )
}
