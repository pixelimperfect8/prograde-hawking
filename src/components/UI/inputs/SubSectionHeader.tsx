
interface SubSectionHeaderProps {
    title: string
}

export default function SubSectionHeader({ title }: SubSectionHeaderProps) {
    return (
        <span style={{
            fontSize: '0.7rem',
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 600,
            display: 'block'
            // Margin is usually handled by the parent container or the element's position
            // But we can add a default marginBottom?
            // GlassControl uses inline span inside a div with gap.
            // Let's keep it simple.
        }}>
            {title}
        </span>
    )
}
