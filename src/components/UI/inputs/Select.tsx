
import { useState, useRef, useEffect } from 'react'

interface SelectProps {
    label: string
    value: string
    options: string[]
    onChange: (val: string) => void
}

export default function Select({ label, value, options, onChange }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div
            ref={ref}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                position: 'relative',
                zIndex: isOpen ? 50 : 1 // Bring to front when open
            }}
        >
            <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
            }}>
                {label}
            </span>

            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                }}>
                    {value}
                </span>

                {/* Chevron */}
                <div style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    opacity: 0.5,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '140px',
                    background: 'rgba(10, 10, 10, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    animation: 'fadeIn 0.15s ease-out'
                }}>
                    {options.map(opt => (
                        <div
                            key={opt}
                            onClick={() => {
                                onChange(opt)
                                setIsOpen(false)
                            }}
                            style={{
                                padding: '8px 12px',
                                fontSize: '12px',
                                color: opt === value ? '#FFF' : 'rgba(255,255,255,0.6)',
                                background: opt === value ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.1s',
                                fontFamily: 'Inter, sans-serif',
                                textAlign: 'right'
                            }}
                            onMouseEnter={(e) => {
                                if (opt !== value) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                    e.currentTarget.style.color = '#FFF'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (opt !== value) {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                                }
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}

            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-5px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    )
}
