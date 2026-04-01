import { useState, useRef } from "react";
import { M } from "../constants/colors";
import Btn from "../components/ui/Btn";
import { uploadRFP, uploadVendors } from "../api/documents";
import { getSessionByName } from "../api/sessions";

export default function UploadPage({ go, onSessionId, createSession, setVendorCount }) {
    const [sessionName, setSessionName] = useState("");
    const [rfpFile, setRfpFile] = useState(null);
    const [vendorFiles, setVendorFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const rfpInputRef = useRef(null);
    const vendorInputRef = useRef(null);

    const handleRfpDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file && file.name.endsWith(".pdf")) setRfpFile(file);
    };

    const handleVendorDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer?.files || []).filter((f) =>
            f.name.endsWith(".pdf"),
        );
        setVendorFiles((prev) => [...prev, ...files]);
    };

    const removeVendor = (index) =>
        setVendorFiles((prev) => prev.filter((_, i) => i !== index));

    const canSubmit = sessionName.trim();

    async function handleSubmit() {
        if (!canSubmit || loading) return;
        setLoading(true);
        setError(null);

        try {
            try {
                // Try to find existing session with this name
                const existing = await getSessionByName(sessionName);

                if (existing) {
                    onSessionId(existing.id)
                    if (existing.status === "validated") go("dashboard")
                    else if (existing.status === "extracted") go("requirements")
                    else go("pipeline")
                    return
                }
            } catch {
                // Not found, proceed to create new session
            }
            if (!rfpFile || vendorFiles.length === 0) {
                setError("Please upload an RFP and at least one vendor proposal.")
                setLoading(false)
                return
            }
            const id = await createSession(sessionName.trim());
            await uploadRFP(id, rfpFile);
            await uploadVendors(id, vendorFiles);
            onSessionId(id);
            setVendorCount(vendorFiles.length);
            go("pipeline");
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 700 }}>
            <p
                style={{
                    fontSize: 11,
                    color: M.ov0,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                    fontFamily: "'JetBrains Mono', monospace",
                }}
            >
                New Session
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
                Upload Documents
            </h1>
            <p style={{ fontSize: 13, color: M.ov1, marginBottom: 28 }}>
                Upload your RFP and all vendor proposals to begin the compliance
                analysis.
            </p>

            {/* Drop zones */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {/* RFP */}
                <div
                    style={{
                        background: M.s0,
                        border: `1px solid ${M.s1}`,
                        borderRadius: 10,
                        padding: 24,
                    }}
                >
                    <p
                        style={{
                            fontSize: 11,
                            color: M.ov0,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            marginBottom: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                        }}
                    >
                        RFP Document
                    </p>

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleRfpDrop}
                        onClick={() => rfpInputRef.current?.click()}
                        style={{
                            border: `1px dashed ${rfpFile ? M.teal : M.s2}`,
                            borderRadius: 8,
                            padding: "28px 16px",
                            textAlign: "center",
                            marginBottom: 14,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            background: rfpFile ? `${M.teal}08` : "transparent",
                        }}
                    >
                        <div style={{ fontSize: 22, marginBottom: 8, color: M.ov1 }}>⌗</div>
                        <p style={{ fontSize: 12, color: M.ov1, marginBottom: 4 }}>
                            {rfpFile ? "Click to replace" : "Drop PDF here"}
                        </p>
                        <p style={{ fontSize: 11, color: M.ov0 }}>or click to browse</p>
                    </div>
                    <input
                        ref={rfpInputRef}
                        type="file"
                        accept=".pdf"
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setRfpFile(f);
                        }}
                    />

                    {rfpFile && (
                        <div
                            style={{
                                background: `${M.blue}18`,
                                border: `1px solid ${M.blue}33`,
                                borderRadius: 6,
                                padding: "8px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 11,
                                    color: M.blue,
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}
                            >
                                PDF
                            </span>
                            <span
                                style={{
                                    fontSize: 12,
                                    color: M.sub1,
                                    flex: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {rfpFile.name}
                            </span>
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setRfpFile(null);
                                }}
                                style={{ fontSize: 14, color: M.ov0, cursor: "pointer" }}
                            >
                                ×
                            </span>
                        </div>
                    )}
                </div>

                {/* Vendors */}
                <div
                    style={{
                        background: M.s0,
                        border: `1px solid ${M.s1}`,
                        borderRadius: 10,
                        padding: 24,
                    }}
                >
                    <p
                        style={{
                            fontSize: 11,
                            color: M.ov0,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            marginBottom: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                        }}
                    >
                        Vendor Proposals
                    </p>

                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleVendorDrop}
                        onClick={() => vendorInputRef.current?.click()}
                        style={{
                            border: `1px dashed ${M.s2}`,
                            borderRadius: 8,
                            padding: "16px",
                            textAlign: "center",
                            marginBottom: 14,
                            cursor: "pointer",
                            transition: "all 0.15s",
                        }}
                    >
                        <p style={{ fontSize: 12, color: M.ov1, marginBottom: 2 }}>
                            Drop PDFs here
                        </p>
                        <p style={{ fontSize: 11, color: M.ov0 }}>
                            multiple files accepted
                        </p>
                    </div>
                    <input
                        ref={vendorInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setVendorFiles((prev) => [...prev, ...files]);
                        }}
                    />

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {vendorFiles.map((f, i) => (
                            <div
                                key={i}
                                style={{
                                    background: `${M.mauve}12`,
                                    border: `1px solid ${M.mauve}28`,
                                    borderRadius: 6,
                                    padding: "7px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: M.mauve,
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                >
                                    PDF
                                </span>
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: M.sub1,
                                        flex: 1,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {f.name}
                                </span>
                                <span
                                    onClick={() => removeVendor(i)}
                                    style={{ fontSize: 14, color: M.ov0, cursor: "pointer" }}
                                >
                                    ×
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Session name */}
            <div
                style={{
                    background: M.s0,
                    border: `1px solid ${M.s1}`,
                    borderRadius: 10,
                    padding: 20,
                    marginBottom: 24,
                }}
            >
                <p
                    style={{
                        fontSize: 11,
                        color: M.ov0,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                    }}
                >
                    Session Name
                </p>
                <input
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g. bpdcl_rfp_2025"
                    style={{
                        width: "100%",
                        background: M.mantle,
                        border: `1px solid ${M.s1}`,
                        borderRadius: 6,
                        color: M.text,
                        fontSize: 13,
                        padding: "9px 12px",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        outline: "none",
                    }}
                />
            </div>

            {error && (
                <p
                    style={{
                        fontSize: 12,
                        color: M.red,
                        marginBottom: 16,
                        padding: "8px 12px",
                        background: `${M.red}12`,
                        borderRadius: 6,
                        border: `1px solid ${M.red}33`,
                    }}
                >
                    {error}
                </p>
            )}

            <Btn onClick={handleSubmit} disabled={!canSubmit || loading}>
                {loading ? "Uploading..." : "Start Analysis →"}
            </Btn>
        </div>
    );
}
