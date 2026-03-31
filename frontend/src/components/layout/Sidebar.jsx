/*
Fixed left sidebar. Shows 5 step indicators.
Active step highlighted in mauve.
Completed steps are clickable to go back.
Session info panel at the bottom.
*/
const STEPS = ["Upload", "Analyse", "Review", "Validate", "Dashboard"]
const STEP_PAGES = ["upload", "pipeline", "requirements", "validation", "dashboard"]

export default function Sidebar({ step, sessionName, vendorCount, onNavigate }) {
    return (
        <aside style={{
            width: 220,
            background: "#181825",
            borderRight: "1px solid #45475a",
            padding: "28px 0",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100vh",
        }}>

            {/* Logo */}
            <div style={{
                padding: "0 20px 32px",
                display: "flex",
                alignItems: "center",
                gap: 8,
            }}>
                <div style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#cba6f7",
                    boxShadow: "0 0 8px #cba6f7",
                }} />
                <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#cba6f7",
                    fontFamily: "'JetBrains Mono', monospace",
                }}>TCV</span>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
                {STEPS.map((label, i) => {
                    const active = i === step
                    const done = i < step

                    return (
                        <div
                            key={label}
                            onClick={done ? () => onNavigate(STEP_PAGES[i]) : undefined}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "9px 10px",
                                borderRadius: 6,
                                cursor: done ? "pointer" : "default",
                                background: active ? "#cba6f718" : "transparent",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={e => { if (done && !active) e.currentTarget.style.background = "#31324488" }}
                            onMouseLeave={e => { if (done && !active) e.currentTarget.style.background = "transparent" }}
                        >
                            {/* Step number circle */}
                            <div style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 600,
                                flexShrink: 0,
                                fontFamily: "'JetBrains Mono', monospace",
                                background: active ? "#cba6f7" : done ? "#94e2d525" : "#313244",
                                color: active ? "#11111b" : done ? "#94e2d5" : "#6c7086",
                                border: done && !active ? "1px solid #94e2d550" : "none",
                            }}>
                                {i + 1}
                            </div>

                            <span style={{
                                fontSize: 13,
                                fontWeight: active ? 500 : 400,
                                color: active ? "#cdd6f4" : done ? "#bac2de" : "#6c7086",
                            }}>
                                {label}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Session info */}
            <div style={{ marginTop: "auto", padding: "0 20px" }}>
                <div style={{
                    padding: 12,
                    borderRadius: 6,
                    background: "#313244",
                    fontSize: 11,
                    color: "#7f849c",
                    lineHeight: 1.6,
                }}>
                    <div style={{ color: "#a6adc8", fontWeight: 500, marginBottom: 4 }}>Session</div>
                    {sessionName || "—"}<br />
                    {vendorCount > 0
                        ? <span style={{ color: "#94e2d5" }}>{vendorCount} vendor{vendorCount !== 1 ? "s" : ""}</span>
                        : <span style={{ color: "#6c7086" }}>No vendors yet</span>
                    }
                </div>
            </div>

        </aside>
    )
}