/*
Dark scrolling terminal panel.
Accepts lines array and done boolean.
Auto-scrolls to bottom on new lines.
Colours: active line = yellow, done lines
starting with ✓ = teal, others = sub0.
Shows blinking cursor when not done.
*/
import { useEffect, useRef } from "react"

export default function LogTerminal({ lines, done }) {
    const ref = useRef(null)

    useEffect(() => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight
        }
    }, [lines])

    return (
        <div
            ref={ref}
            style={{
                background: "#11111b",
                border: "1px solid #45475a",
                borderRadius: 10,
                padding: "20px 24px",
                height: 380,
                overflowY: "auto",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                lineHeight: 1.9,
            }}
        >
            {lines.map((line, i) => {
                const isActive = i === lines.length - 1 && !done
                const isSuccess = line.startsWith("✅") || line.startsWith("✓")
                const color = isActive ? "#f9e2af" : isSuccess ? "#94e2d5" : "#a6adc8"
                const icon = isActive ? "›" : isSuccess ? "✓" : "·"
                const iconColor = isActive ? "#f9e2af" : isSuccess ? "#94e2d580" : "#585b70"

                return (
                    <div key={i} style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: iconColor, flexShrink: 0 }}>{icon}</span>
                        <span style={{ color }}>{line}</span>
                    </div>
                )
            })}

            {/* blinking cursor while running */}
            {!done && (
                <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ color: "#585b70" }}>›</span>
                    <span style={{ color: "#585b70" }}>_</span>
                </div>
            )}

            {/* completion message */}
            {done && lines.length > 0 && (
                <div style={{ marginTop: 8, color: "#a6e3a1", fontWeight: 500 }}>
                    Complete.
                </div>
            )}
        </div>
    )
}