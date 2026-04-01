import { M } from "../constants/colors"
import Btn from "../components/ui/Btn"
import LogTerminal from "../components/ui/LogTerminal"
import useSSE from "../hooks/useSSE"

export default function PipelinePage({ go, sessionId }) {
    const { lines, done, error } = useSSE(
        sessionId,
        `/api/sessions/${sessionId}/stream/rfp`,
        "extracted"
    )

    const chunkCount = (() => {
        const line = lines.find(l => l.includes("Created") && l.includes("chunks"))
        if (!line) return 0 // fallback until we know
        const match = line.match(/(\d+) chunks/)
        return match ? parseInt(match[1]) : 11
    })()

    // 4 fixed + N chunks + 2 dedup + 2 save + 1 done
    const EXPECTED_STEPS = chunkCount === 0 ? 100 : 4 + chunkCount + 2 + 2 + 1

    const progress = done
        ? 100
        : lines.length === 0
            ? 0
            : Math.min(Math.round((lines.length / EXPECTED_STEPS) * 100), 99)

    return (
        <div style={{ maxWidth: 680 }}>
            <p style={{
                fontSize: 11, color: M.ov0, letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 6,
                fontFamily: "'JetBrains Mono', monospace",
            }}>
                Step 2 — Processing
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
                Analysing RFP
            </h1>
            <p style={{ fontSize: 13, color: M.ov1, marginBottom: 24 }}>
                Extracting and deduplicating compliance requirements from your tender document.
            </p>

            {/* Progress bar */}
            <div style={{ marginBottom: 20 }}>
                <div style={{
                    display: "flex", justifyContent: "space-between", marginBottom: 6,
                }}>
                    <span style={{
                        fontSize: 11, color: M.ov0,
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        Extraction progress
                    </span>
                    <span style={{
                        fontSize: 11, color: done ? M.teal : M.mauve,
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        {progress}%
                    </span>
                </div>
                <div style={{
                    height: 3, background: M.s1, borderRadius: 2, overflow: "hidden",
                }}>
                    <div style={{
                        height: "100%", width: `${progress}%`,
                        background: done ? M.teal : M.mauve,
                        borderRadius: 2, transition: "width 0.6s ease",
                    }} />
                </div>
            </div>

            <LogTerminal lines={lines} done={done} />

            {error && (
                <p style={{
                    fontSize: 12, color: M.yell, marginTop: 8,
                    fontFamily: "'JetBrains Mono', monospace",
                }}>
                    ⚠ {error}
                </p>
            )}

            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginTop: 20,
            }}>
                <span style={{ fontSize: 12, color: M.ov0 }}>
                    {done
                        ? `✅ ${lines.length} / ${lines.length} steps completed`
                        : `${lines.length} / ${EXPECTED_STEPS} steps completed`}                </span>
                <Btn onClick={() => go("requirements")} disabled={!done}>
                    Review Requirements →
                </Btn>
            </div>
        </div>
    )
}