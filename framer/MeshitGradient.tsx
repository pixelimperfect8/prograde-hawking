import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * MESHIT Gradient Background
 * 
 * A Framer code component that embeds animated mesh gradients.
 * Configure colors, speed, and effects via the property controls.
 * 
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 300
 */
export default function MeshitGradient(props: {
    // Colors
    color1: string
    color2: string
    color3: string
    color4: string
    // Settings
    speed: number
    noiseDensity: number
    noiseStrength: number
    // Effects
    kaleidoscope: boolean
    loop: boolean
    // Base URL (your deployed app)
    baseUrl: string
}) {
    const {
        color1,
        color2,
        color3,
        color4,
        speed,
        noiseDensity,
        noiseStrength,
        kaleidoscope,
        loop,
        baseUrl
    } = props

    // Build the embed URL with all parameters
    const params = new URLSearchParams()
    params.set("c1", color1)
    params.set("c2", color2)
    params.set("c3", color3)
    params.set("c4", color4)
    params.set("spd", speed.toString())
    params.set("den", noiseDensity.toString())
    params.set("str", noiseStrength.toString())
    params.set("kal", kaleidoscope.toString())
    params.set("loop", loop.toString())
    params.set("embed", "true")

    const embedUrl = `${baseUrl}/?${params.toString()}`

    return (
        <iframe
            src={embedUrl}
            style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
            }}
            allow="accelerometer; autoplay; encrypted-media; gyroscope"
        />
    )
}

// Framer Property Controls
addPropertyControls(MeshitGradient, {
    baseUrl: {
        type: ControlType.String,
        title: "App URL",
        defaultValue: "https://prograde-hawking.vercel.app",
        description: "Your deployed gradient app URL"
    },
    color1: {
        type: ControlType.Color,
        title: "Color 1",
        defaultValue: "#ff0055",
    },
    color2: {
        type: ControlType.Color,
        title: "Color 2",
        defaultValue: "#00ff99",
    },
    color3: {
        type: ControlType.Color,
        title: "Color 3",
        defaultValue: "#5500ff",
    },
    color4: {
        type: ControlType.Color,
        title: "Color 4",
        defaultValue: "#ffaa00",
    },
    speed: {
        type: ControlType.Number,
        title: "Speed",
        defaultValue: 0.4,
        min: 0,
        max: 2,
        step: 0.1,
    },
    noiseDensity: {
        type: ControlType.Number,
        title: "Noise Density",
        defaultValue: 2.0,
        min: 0,
        max: 5,
        step: 0.1,
    },
    noiseStrength: {
        type: ControlType.Number,
        title: "Noise Strength",
        defaultValue: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
    },
    kaleidoscope: {
        type: ControlType.Boolean,
        title: "Kaleidoscope",
        defaultValue: false,
    },
    loop: {
        type: ControlType.Boolean,
        title: "Seamless Loop",
        defaultValue: false,
    },
})
