
import AnimatedSmiley from './AnimatedSmiley'

export default function PersistentLogo() {
    return (
        <div style={{
            position: 'fixed',
            top: '40px',
            left: '40px',
            zIndex: 200, // Above Overlay (100)
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'none'
        }}>
            <AnimatedSmiley size={118} />
        </div>
    )
}
