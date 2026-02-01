import { View } from '@react-three/drei'
import { PerspectiveCamera } from '@react-three/drei'
import ThumbnailScene from '../ThumbnailScene'
import { useStore } from '../../store'

interface ViewPortalProps {
    trackRef: React.RefObject<HTMLDivElement>
    modeId: string
}

export function ViewPortal({ trackRef, modeId }: ViewPortalProps) {
    return (
        <View track={trackRef as any}>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
            <ThumbnailScene mode={modeId} />
        </View>
    )
}

export default function LandingPageViews() {
    const { landingPageRefs } = useStore()

    if (!landingPageRefs || landingPageRefs.length === 0) return null

    return (
        <>
            {landingPageRefs.map((item: any) => (
                <ViewPortal key={item.id} trackRef={item.ref} modeId={item.id} />
            ))}
        </>
    )
}
