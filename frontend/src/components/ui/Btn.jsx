/*
Button component with 4 variants:
primary (mauve), ghost (transparent),
danger (red tint), export (teal tint).
Accepts disabled prop.
*/
export default function Btn({ children, onClick, disabled, variant = "primary" }) {
    const base = {
        padding: "9px 20px",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        border: "none",
        transition: "opacity 0.15s",
        opacity: disabled ? 0.35 : 1,
        fontFamily: "'IBM Plex Sans', sans-serif",
        whiteSpace: "nowrap",
    }

    const variants = {
        primary: { background: "#cba6f7", color: "#11111b" },
        ghost: { background: "transparent", color: "#bac2de", border: "1px solid #45475a" },
        danger: { background: "#f38ba822", color: "#f38ba8", border: "1px solid #f38ba844" },
        export: { background: "#94e2d518", color: "#94e2d5", border: "1px solid #94e2d544" },
    }

    return (
        <button
            onClick={!disabled ? onClick : undefined}
            style={{ ...base, ...variants[variant] }}
        >
            {children}
        </button>
    )
}