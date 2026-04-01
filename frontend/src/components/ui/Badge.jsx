export default function Badge({ label, color }) {
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.03em",
            background: `${color}22`,
            color: color,
            border: `1px solid ${color}44`,
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: "nowrap",
        }}>
            {label}
        </span>
    )
}