/*
Step 1. Two drop zones (RFP + vendors).
Session name input.
On submit: createSession() → uploadRFP() → uploadVendors() → navigate to PipelinePage.
*/
export default function UploadPage({ go, setSessionId, setSessionName, setVendorCount }) {
    return (
        <div>
            <p style={{
                fontSize: 11, color: "#6c7086", letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 6,
                fontFamily: "'JetBrains Mono', monospace"
            }}>
                New Session
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 600 }}>Upload Documents</h1>
            <p style={{ marginTop: 12, color: "#7f849c", fontSize: 13 }}>
                Feature 1 — coming next.
            </p>
        </div>
    )
}