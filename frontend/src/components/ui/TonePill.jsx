/*
Displays tone score as a coloured pill.
≥7 = green/Precise, 5-6 = yellow/Moderate,
<5 = red/Vague. Shows score/10 + label.
*/
export default function TonePill({ tone }) {
    // tone is 0-100 from the backend
    const col = tone >= 70 ? "#a6e3a1" : tone >= 40 ? "#f9e2af" : "#f38ba8"
    const label = tone >= 70 ? "Precise" : tone >= 40 ? "Moderate" : "Vague"

    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 500,
            background: `${col}22`,
            color: col,
            border: `1px solid ${col}44`,
            fontFamily: "'JetBrains Mono', monospace",
        }}>
            <span style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: col,
                flexShrink: 0,
            }} />
            {tone} — {label}
        </span>
    )
}