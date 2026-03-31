import { useState, useEffect, useRef } from "react"

const M = {
    base: "#1e1e2e", mantle: "#181825", crust: "#11111b",
    s0: "#313244", s1: "#45475a", s2: "#585b70",
    ov0: "#6c7086", ov1: "#7f849c", sub0: "#a6adc8",
    sub1: "#bac2de", text: "#cdd6f4",
    blue: "#89b4fa", teal: "#94e2d5", green: "#a6e3a1",
    yell: "#f9e2af", peach: "#fab387", red: "#f38ba8",
    mauve: "#cba6f7", lav: "#b4befe", saph: "#74c7ec",
}

const REQS = [
    { id: "req_001", cat: "Legal", text: "Vendor must provide ISO 27001 certification", page: 4, on: true },
    { id: "req_002", cat: "Technical", text: "System must support 24/7 helpdesk availability", page: 7, on: true },
    { id: "req_003", cat: "Financial", text: "Vendor shall provide a fixed-price contract with no variable fees", page: 12, on: true },
    { id: "req_004", cat: "Operational", text: "Vendor must complete full delivery within 90 days of contract signing", page: 15, on: true },
    { id: "req_005", cat: "Technical", text: "System must maintain a minimum 99.9% uptime SLA", page: 9, on: true },
    { id: "req_006", cat: "Legal", text: "Vendor is required to maintain strict local data residency compliance", page: 22, on: false },
]

const VENDORS = [
    { name: "TechCorp Solutions", score: 87.3, risk: "Low", flags: 2, tone: 8, toneSummary: "Language is precise and committal throughout. Specific certification standards, version years, and renewal cadences are cited. Only one hedging clause detected in the pricing section." },
    { name: "Meridian Systems", score: 52.1, risk: "High", flags: 5, tone: 3, toneSummary: "Vendor's language is heavily vague — 4 clauses use best-efforts or subject-to-change phrasing with no firm commitments. Multiple requirements addressed with aspirational rather than contractual language." },
    { name: "BlueWave Ltd", score: 68.4, risk: "Medium", flags: 3, tone: 6, toneSummary: "Moderately committal language overall. Two escape clauses introduce delivery and pricing ambiguity. Core technical sections are precise but commercial terms rely on client-side dependencies." },
]

const RESULTS = {
    "TechCorp Solutions": {
        req_001: { s: "Met", c: 91, cos: 0.94, eq: "Evidence explicitly states certification standard, version year, and renewal cadence.", excerpt: "TechCorp holds ISO 27001:2022 certification, renewed annually.", page: 6 },
        req_002: { s: "Met", c: 88, cos: 0.89, eq: "Direct statement of round-the-clock availability with no ambiguous qualifiers.", excerpt: "Our support team operates around the clock, 365 days a year.", page: 11 },
        req_003: { s: "Partial", c: 63, cos: 0.72, eq: "Pricing is fixed for year one but the annual review clause introduces uncertainty.", excerpt: "Pricing is fixed for year one, subject to annual review thereafter.", page: 18, why: "Annual review clause introduces variable pricing after year one." },
        req_004: { s: "Met", c: 95, cos: 0.97, eq: "Exact 90-day figure matched with a contractual guarantee.", excerpt: "Full deployment guaranteed within 90 days of contract execution.", page: 21 },
        req_005: { s: "Met", c: 89, cos: 0.91, eq: "Uptime figure exceeds requirement; financial penalty commitment strengthens enforceability.", excerpt: "We commit to 99.95% uptime backed by financial penalties.", page: 14 },
        req_006: { s: "Partial", c: 71, cos: 0.76, eq: '"Unless otherwise agreed" introduces a carve-out that could negate residency compliance.', excerpt: "Data is stored within the jurisdiction unless otherwise agreed.", page: 27, why: '"Unless otherwise agreed" introduces ambiguity on residency.' },
    },
    "Meridian Systems": {
        req_001: { s: "Missing", c: 0, cos: 0.21, eq: "No content related to ISO certification found anywhere in the document.", excerpt: null, page: null, why: "No ISO certification mentioned anywhere in the document." },
        req_002: { s: "Partial", c: 54, cos: 0.61, eq: "Extended business hours is materially different from 24/7.", excerpt: "Support is available during extended business hours on a priority basis.", page: 9, why: "Extended hours is not equivalent to 24/7 availability." },
        req_003: { s: "Missing", c: 0, cos: 0.18, eq: "Additional fees clause directly contradicts the fixed-price obligation.", excerpt: null, page: null, why: "Additional fees clause directly contradicts fixed-price requirement." },
        req_004: { s: "Met", c: 82, cos: 0.88, eq: "90-day window explicitly referenced; no conditional language found.", excerpt: "Project completion is scheduled within the 90-day delivery window.", page: 14 },
        req_005: { s: "Missing", c: 0, cos: 0.14, eq: "Best-efforts language found instead of a quantified uptime commitment.", excerpt: null, page: null, why: "No uptime commitment found. Best-efforts language used instead." },
        req_006: { s: "Partial", c: 61, cos: 0.66, eq: "Regional infrastructure referenced but no jurisdiction is named.", excerpt: "All customer data remains within our regional infrastructure.", page: 31, why: "Regional infrastructure not defined. No explicit jurisdiction stated." },
    },
    "BlueWave Ltd": {
        req_001: { s: "Met", c: 79, cos: 0.83, eq: "Certification confirmed across all delivery teams.", excerpt: "BlueWave maintains ISO 27001 certification across all delivery teams.", page: 5 },
        req_002: { s: "Met", c: 84, cos: 0.87, eq: "Exact 24/7 phrasing matched; days and hours both specified.", excerpt: "Helpdesk availability is guaranteed 24 hours a day, 7 days a week.", page: 10 },
        req_003: { s: "Missing", c: 0, cos: 0.22, eq: "Variable pricing components referenced — contradicts fixed-price requirement.", excerpt: null, page: null, why: "Pricing section references variable components based on usage." },
        req_004: { s: "Partial", c: 58, cos: 0.69, eq: '"Subject to client-side readiness" creates an escape clause.', excerpt: "Target delivery is set at 90 days, subject to client-side readiness.", page: 17, why: '"Subject to client-side readiness" introduces an escape clause.' },
        req_005: { s: "Met", c: 77, cos: 0.81, eq: "Exact 99.9% figure matched; backed by a named SLA document.", excerpt: "Our platform maintains 99.9% uptime as defined in our standard SLA.", page: 13 },
        req_006: { s: "Missing", c: 0, cos: 0.09, eq: "No data residency policy found anywhere in the proposal.", excerpt: null, page: null, why: "No data residency policy mentioned in the proposal." },
    },
}

// likelihood scored by Gemini per flag
const FLAGS = {
    "Meridian Systems": [
        { text: "Additional fees may apply upon delivery and installation of components at client site", type: "Financial", sev: "High", likelihood: "High", page: 8, impact: "No cost ceiling defined. Exposed to unexpected charges post-contract." },
        { text: "Service levels are subject to change without prior notice during peak operational periods", type: "Legal", sev: "High", likelihood: "Medium", page: 14, impact: "Vendor can unilaterally alter agreed service terms at any time." },
        { text: "Deliverables to be confirmed at a later stage of the engagement at mutual agreement", type: "Scope", sev: "Medium", likelihood: "High", page: 19, impact: "No enforceable scope baseline defined in the contract." },
        { text: "Our liability is limited to the value of services rendered in the preceding calendar month", type: "Legal", sev: "High", likelihood: "Low", page: 23, impact: "Severely limits financial recourse in the event of a material breach." },
        { text: "Support response times are provided on a best efforts basis and are not guaranteed", type: "Operational", sev: "Medium", likelihood: "High", page: 31, impact: "Removes any enforceable SLA obligation from the vendor." },
    ],
    "BlueWave Ltd": [
        { text: "Pricing for additional modules and integrations may vary based on complexity at time of request", type: "Financial", sev: "High", likelihood: "High", page: 22, impact: "Opens door to unanticipated costs beyond the initial contract value." },
        { text: "Project timeline is subject to dependency on client-side resource availability and approvals", type: "Scope", sev: "Medium", likelihood: "Medium", page: 17, impact: "Delivery delays can be attributed to client, reducing vendor accountability." },
        { text: "BlueWave reserves the right to substitute equivalent personnel at its discretion", type: "Operational", sev: "Low", likelihood: "Medium", page: 28, impact: "Key personnel commitments may not be upheld during delivery." },
    ],
    "TechCorp Solutions": [
        { text: "Annual pricing review may result in adjustments reflecting market conditions", type: "Financial", sev: "Medium", likelihood: "High", page: 18, impact: "Fixed price applies for year one only; costs may escalate annually." },
        { text: "Data storage jurisdiction may be altered where operationally necessary with prior notice", type: "Legal", sev: "Low", likelihood: "Low", page: 27, impact: "Data residency compliance could be compromised without strong consent controls." },
    ],
}

const LOG_RFP = [
    "Extracting text from RFP document (48 pages)...",
    "Chunking RFP into 28 segments",
    "Analysing RFP chunks 1–10 of 28...",
    "Analysing RFP chunks 11–20 of 28...",
    "Analysing RFP chunks 21–28 of 28...",
    "Requirements found so far: 34",
    "Deduplicating and merging requirements...",
    "✓ Requirements finalised — 6 unique requirements ready for review",
]

const LOG_VALIDATION = [
    "Loading confirmed requirements (5 of 6 selected)...",
    "Extracting text from vendor proposals (3 documents)...",
    "Building FAISS index for TechCorp Solutions (38 chunks)...",
    "Validating TechCorp Solutions — batch 1 of 1...",
    "Probing confidence — TechCorp Solutions batch 1...",
    "Scanning TechCorp Solutions for hidden risks...",
    "✓ TechCorp Solutions complete — 87.3% compliance, 2 risk flags",
    "Building FAISS index for Meridian Systems (41 chunks)...",
    "Validating Meridian Systems — batch 1 of 1...",
    "Probing confidence — Meridian Systems batch 1...",
    "Scanning Meridian Systems for hidden risks...",
    "✓ Meridian Systems complete — 52.1% compliance, 5 risk flags",
    "Building FAISS index for BlueWave Ltd (35 chunks)...",
    "Validating BlueWave Ltd — batch 1 of 1...",
    "Probing confidence — BlueWave Ltd batch 1...",
    "Scanning BlueWave Ltd for hidden risks...",
    "✓ BlueWave Ltd complete — 68.4% compliance, 3 risk flags",
    "✓ All vendors validated.",
]

const CAT_COLORS = { Legal: M.mauve, Technical: M.blue, Financial: M.green, Operational: M.saph }
const STATUS_COLOR = { Met: M.green, Partial: M.yell, Missing: M.red }
const RISK_COLOR = { Low: M.green, Medium: M.yell, High: M.red }
const SEV_COLOR = { High: M.red, Medium: M.peach, Low: M.yell }

function vendorSummary(vendorName, checkedReqs) {
    const results = RESULTS[vendorName] || {}
    const ids = checkedReqs.map(r => r.id)
    let met = 0, partial = 0, missing = 0, confSum = 0, confCount = 0
    ids.forEach(id => {
        const r = results[id]; if (!r) return
        if (r.s === "Met") { met++; if (r.c > 0) { confSum += r.c; confCount++ } }
        if (r.s === "Partial") { partial++; if (r.c > 0) { confSum += r.c; confCount++ } }
        if (r.s === "Missing") { missing++ }
    })
    const v = VENDORS.find(x => x.name === vendorName)
    return { met, partial, missing, avgConf: confCount > 0 ? Math.round(confSum / confCount) : 0, score: v?.score ?? 0, flags: v?.flags ?? 0, risk: v?.risk ?? "—", tone: v?.tone ?? 0, toneSummary: v?.toneSummary ?? "" }
}

// ── shared components ─────────────────────────────────────────────────────────

const Badge = ({ label, color }) => (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, letterSpacing: "0.03em", background: `${color}22`, color, border: `1px solid ${color}44`, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
)

const Btn = ({ children, onClick, disabled, variant = "primary" }) => {
    const base = { padding: "9px 20px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer", border: "none", transition: "opacity 0.15s", opacity: disabled ? 0.35 : 1, fontFamily: "'IBM Plex Sans', sans-serif" }
    const styles = {
        primary: { background: M.mauve, color: M.crust },
        ghost: { background: "transparent", color: M.sub1, border: `1px solid ${M.s1}` },
        export: { background: `${M.teal}18`, color: M.teal, border: `1px solid ${M.teal}44` },
    }
    return <button onClick={!disabled ? onClick : undefined} style={{ ...base, ...styles[variant] }}>{children}</button>
}

function TonePill({ tone }) {
    const col = tone >= 7 ? M.green : tone >= 5 ? M.yell : M.red
    const label = tone >= 7 ? "Precise" : tone >= 5 ? "Moderate" : "Vague"
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: `${col}22`, color: col, border: `1px solid ${col}44`, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: col, flexShrink: 0 }} />
            {tone}/10 — {label}
        </span>
    )
}

const StatusCell = ({ vendor, reqId, onClick }) => {
    const r = RESULTS[vendor]?.[reqId]
    if (!r) return <td style={{ padding: "10px 12px", textAlign: "center" }}>—</td>
    return (
        <td style={{ padding: "10px 12px", textAlign: "center" }}>
            <span onClick={() => onClick(vendor, reqId)} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: `${STATUS_COLOR[r.s]}22`, color: STATUS_COLOR[r.s], border: `1px solid ${STATUS_COLOR[r.s]}44`, cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                {r.s}{r.c > 0 ? ` ${r.c}%` : ""}
            </span>
        </td>
    )
}

// ── app ───────────────────────────────────────────────────────────────────────

export default function App() {
    const [page, setPage] = useState("upload")
    const [reqs, setReqs] = useState(REQS)
    const [catFilter, setCatFilter] = useState("All")
    const [logLines, setLogLines] = useState([])
    const [logDone, setLogDone] = useState(false)
    const [deepDive, setDeepDive] = useState(null)
    const [riskVendor, setRiskVendor] = useState(null)
    const [toneOpen, setToneOpen] = useState({})
    const [vendorFiles, setVendorFiles] = useState(["TechCorp_Proposal.pdf", "Meridian_Bid.pdf", "BlueWave_Tender.pdf"])
    const logRef = useRef(null)

    const STEP_PAGES = ["upload", "pipeline", "requirements", "validation", "dashboard"]
    const step = { upload: 0, pipeline: 1, requirements: 2, validation: 3, dashboard: 4, risk: 4 }[page]
    const checkedReqs = reqs.filter(r => r.on)

    useEffect(() => {
        const isRfp = page === "pipeline", isVal = page === "validation"
        if (!isRfp && !isVal) return
        const log = isRfp ? LOG_RFP : LOG_VALIDATION
        setLogLines([]); setLogDone(false)
        let i = 0
        const t = setInterval(() => {
            if (i < log.length) setLogLines(p => [...p, log[i++]])
            else { setLogDone(true); clearInterval(t) }
        }, 220)
        return () => clearInterval(t)
    }, [page])

    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [logLines])

    const cats = ["All", "Technical", "Legal", "Financial", "Operational"]
    const filteredReqs = catFilter === "All" ? reqs : reqs.filter(r => r.cat === catFilter)
    const go = p => { setDeepDive(null); setPage(p) }
    const STEPS = ["Upload", "Analyse", "Review", "Validate", "Dashboard"]

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${M.base}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${M.mantle}; }
        ::-webkit-scrollbar-thumb { background: ${M.s1}; border-radius: 3px; }
        tr:hover td { background: ${M.s0}22 !important; }
        .tone-toggle:hover { background: ${M.s1} !important; }
        .nav-item:hover { background: ${M.s0}88 !important; }
        .drop-zone:hover { border-color: ${M.mauve}66 !important; background: ${M.mauve}08 !important; }
      `}</style>

            <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: M.text, background: M.base }}>

                {/* Sidebar */}
                <aside style={{ width: 220, background: M.mantle, borderRight: `1px solid ${M.s1}`, padding: "28px 0", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
                    <div style={{ padding: "0 20px 32px", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: M.mauve, boxShadow: `0 0 8px ${M.mauve}` }} />
                        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: M.mauve }}>TCV</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}>
                        {STEPS.map((label, i) => {
                            const active = i === step, done = i < step
                            return (
                                <div key={label} className="nav-item" onClick={done ? () => go(STEP_PAGES[i]) : undefined}
                                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 6, cursor: done ? "pointer" : "default", background: active ? `${M.mauve}18` : "transparent", transition: "background 0.15s" }}>
                                    <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, flexShrink: 0, fontFamily: "'JetBrains Mono', monospace", background: active ? M.mauve : done ? `${M.teal}25` : M.s0, color: active ? M.crust : done ? M.teal : M.ov0, border: done && !active ? `1px solid ${M.teal}50` : "none" }}>{i + 1}</div>
                                    <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, color: active ? M.text : done ? M.sub1 : M.ov0 }}>{label}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div style={{ marginTop: "auto", padding: "0 20px" }}>
                        <div style={{ padding: 12, borderRadius: 6, background: M.s0, fontSize: 11, color: M.ov1, lineHeight: 1.6 }}>
                            <div style={{ color: M.sub0, fontWeight: 500, marginBottom: 4 }}>Session</div>
                            gov_tender_2024.pdf<br /><span style={{ color: M.teal }}>3 vendors</span>
                        </div>
                    </div>
                </aside>

                <main style={{ flex: 1, padding: "36px 40px", overflow: "auto", position: "relative" }}>

                    {/* UPLOAD */}
                    {page === "upload" && (
                        <div style={{ maxWidth: 700 }}>
                            <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>New Session</p>
                            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Upload Documents</h1>
                            <p style={{ fontSize: 13, color: M.ov1, marginBottom: 28 }}>Upload your RFP and all vendor proposals to begin the compliance analysis.</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                                <div style={{ background: M.s0, border: `1px solid ${M.s1}`, borderRadius: 10, padding: 24 }}>
                                    <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, fontFamily: "'JetBrains Mono', monospace" }}>RFP Document</p>
                                    <div className="drop-zone" style={{ border: `1px dashed ${M.s2}`, borderRadius: 8, padding: "28px 16px", textAlign: "center", marginBottom: 14, cursor: "pointer", transition: "all 0.15s" }}>
                                        <div style={{ fontSize: 22, marginBottom: 8, color: M.ov1 }}>⌗</div>
                                        <p style={{ fontSize: 12, color: M.ov1, marginBottom: 4 }}>Drop PDF here</p>
                                        <p style={{ fontSize: 11, color: M.ov0 }}>or click to browse</p>
                                    </div>
                                    <div style={{ background: `${M.blue}18`, border: `1px solid ${M.blue}33`, borderRadius: 6, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 11, color: M.blue, fontFamily: "'JetBrains Mono', monospace" }}>PDF</span>
                                        <span style={{ fontSize: 12, color: M.sub1 }}>gov_tender_2024.pdf</span>
                                        <span style={{ fontSize: 11, color: M.ov0, marginLeft: "auto" }}>48 pp</span>
                                    </div>
                                </div>
                                <div style={{ background: M.s0, border: `1px solid ${M.s1}`, borderRadius: 10, padding: 24 }}>
                                    <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, fontFamily: "'JetBrains Mono', monospace" }}>Vendor Proposals</p>
                                    <div className="drop-zone" style={{ border: `1px dashed ${M.s2}`, borderRadius: 8, padding: "16px", textAlign: "center", marginBottom: 14, cursor: "pointer", transition: "all 0.15s" }}>
                                        <p style={{ fontSize: 12, color: M.ov1, marginBottom: 2 }}>Drop PDFs here</p>
                                        <p style={{ fontSize: 11, color: M.ov0 }}>multiple files accepted</p>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {vendorFiles.map((f, i) => (
                                            <div key={i} style={{ background: `${M.mauve}12`, border: `1px solid ${M.mauve}28`, borderRadius: 6, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontSize: 11, color: M.mauve, fontFamily: "'JetBrains Mono', monospace" }}>PDF</span>
                                                <span style={{ fontSize: 12, color: M.sub1, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f}</span>
                                                <span onClick={() => setVendorFiles(v => v.filter((_, j) => j !== i))} style={{ fontSize: 14, color: M.ov0, cursor: "pointer" }}>×</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: M.s0, border: `1px solid ${M.s1}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
                                <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>Session Name</p>
                                <input defaultValue="gov_tender_2024" style={{ width: "100%", background: M.mantle, border: `1px solid ${M.s1}`, borderRadius: 6, color: M.text, fontSize: 13, padding: "9px 12px", fontFamily: "'IBM Plex Sans', sans-serif", outline: "none" }} />
                            </div>
                            <Btn onClick={() => go("pipeline")}>Start Analysis →</Btn>
                        </div>
                    )}

                    {/* PIPELINE */}
                    {page === "pipeline" && (
                        <div style={{ maxWidth: 680 }}>
                            <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>Step 2 — Processing</p>
                            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Analysing RFP</h1>
                            <p style={{ fontSize: 13, color: M.ov1, marginBottom: 24 }}>Extracting and deduplicating compliance requirements from your tender document.</p>
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, color: M.ov0, fontFamily: "'JetBrains Mono', monospace" }}>Extraction progress</span>
                                    <span style={{ fontSize: 11, color: M.mauve, fontFamily: "'JetBrains Mono', monospace" }}>{Math.round((logLines.length / LOG_RFP.length) * 100)}%</span>
                                </div>
                                <div style={{ height: 3, background: M.s1, borderRadius: 2, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${(logLines.length / LOG_RFP.length) * 100}%`, background: logDone ? M.teal : M.mauve, borderRadius: 2, transition: "width 0.3s" }} />
                                </div>
                            </div>
                            <div ref={logRef} style={{ background: M.crust, border: `1px solid ${M.s1}`, borderRadius: 10, padding: "20px 24px", height: 360, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.9, marginBottom: 20 }}>
                                {logLines.map((line, i) => {
                                    const isLast = i === logLines.length - 1 && !logDone
                                    const isDone = line.startsWith("✓")
                                    return (
                                        <div key={i} style={{ display: "flex", gap: 10 }}>
                                            <span style={{ color: isLast ? M.yell : isDone ? `${M.teal}80` : M.s2, flexShrink: 0 }}>{isLast ? "›" : isDone ? "✓" : "·"}</span>
                                            <span style={{ color: isLast ? M.yell : isDone ? M.teal : M.sub0 }}>{line}</span>
                                        </div>
                                    )
                                })}
                                {!logDone && <div style={{ display: "flex", gap: 10 }}><span style={{ color: M.s2 }}>›</span><span style={{ color: M.s2 }}>_</span></div>}
                                {logDone && <div style={{ marginTop: 8, color: M.green, fontWeight: 500 }}>Extraction complete. Review and confirm your requirements.</div>}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 12, color: M.ov0 }}>{logDone ? `${LOG_RFP.length} steps completed` : `${logLines.length} of ${LOG_RFP.length} steps...`}</span>
                                <Btn onClick={() => go("requirements")} disabled={!logDone}>Review Requirements →</Btn>
                            </div>
                        </div>
                    )}

                    {/* REQUIREMENTS */}
                    {page === "requirements" && (() => {
                        const addReq = () => { const newId = `req_${String(reqs.length + 1).padStart(3, "0")}`; setReqs(p => [...p, { id: newId, cat: "Technical", text: "", page: 1, on: true, editing: true }]) }
                        const deleteReq = id => setReqs(p => p.filter(x => x.id !== id))
                        const updateReq = (id, field, val) => setReqs(p => p.map(x => x.id === id ? { ...x, [field]: val } : x))
                        const stopEdit = id => setReqs(p => p.map(x => x.id === id ? { ...x, editing: false } : x))
                        return (
                            <div>
                                <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>Step 3</p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                                    <div>
                                        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Review Requirements</h1>
                                        <p style={{ fontSize: 13, color: M.ov1 }}>Edit, add, or remove requirements. Only checked rows will be validated.</p>
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <Btn onClick={addReq} variant="ghost">+ Add Row</Btn>
                                        <Btn onClick={() => go("validation")}>Confirm {checkedReqs.length} →</Btn>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                                    {[{ label: "Total", val: reqs.length, color: M.sub1 }, { label: "Selected", val: checkedReqs.length, color: M.mauve }, { label: "Skipped", val: reqs.length - checkedReqs.length, color: M.ov1 }].map(({ label, val, color }) => (
                                        <div key={label} style={{ background: M.s0, border: `1px solid ${M.s1}`, borderRadius: 6, padding: "8px 16px", display: "flex", gap: 8, alignItems: "center" }}>
                                            <span style={{ fontSize: 18, fontWeight: 600, color, fontFamily: "'JetBrains Mono', monospace" }}>{val}</span>
                                            <span style={{ fontSize: 11, color: M.ov0 }}>{label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                                    {cats.map(c => (
                                        <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: catFilter === c ? `1px solid ${M.mauve}` : `1px solid ${M.s1}`, background: catFilter === c ? `${M.mauve}22` : "transparent", color: catFilter === c ? M.mauve : M.ov1, fontFamily: "'IBM Plex Sans', sans-serif", transition: "all 0.15s" }}>{c}</button>
                                    ))}
                                </div>
                                <div style={{ background: M.s0, border: `1px solid ${M.s1}`, borderRadius: 10, overflow: "hidden" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${M.s1}` }}>
                                                {["", "ID", "Category", "Requirement", "Page", ""].map((h, i) => (
                                                    <th key={i} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 500, color: M.ov0, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap" }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReqs.map(r => (
                                                <tr key={r.id} style={{ borderBottom: `1px solid ${M.s1}33` }}>
                                                    <td style={{ padding: "10px 14px", width: 36 }}><input type="checkbox" checked={r.on} onChange={() => updateReq(r.id, "on", !r.on)} style={{ accentColor: M.mauve, cursor: "pointer" }} /></td>
                                                    <td style={{ padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: M.ov1, whiteSpace: "nowrap" }}>{r.id}</td>
                                                    <td style={{ padding: "10px 14px", minWidth: 130 }}>
                                                        {r.editing
                                                            ? <select value={r.cat} onChange={e => updateReq(r.id, "cat", e.target.value)} style={{ background: M.s1, border: `1px solid ${M.s2}`, borderRadius: 4, color: M.text, fontSize: 12, padding: "4px 8px", fontFamily: "'IBM Plex Sans', sans-serif" }}>
                                                                {["Technical", "Legal", "Financial", "Operational"].map(c => <option key={c}>{c}</option>)}
                                                            </select>
                                                            : <span onClick={() => updateReq(r.id, "editing", true)} style={{ cursor: "pointer" }}><Badge label={r.cat} color={CAT_COLORS[r.cat]} /></span>
                                                        }
                                                    </td>
                                                    <td style={{ padding: "8px 14px", maxWidth: 420 }}>
                                                        {r.editing
                                                            ? <textarea value={r.text} onChange={e => updateReq(r.id, "text", e.target.value)} onBlur={() => stopEdit(r.id)} autoFocus rows={2} style={{ width: "100%", background: M.s1, border: `1px solid ${M.mauve}66`, borderRadius: 4, color: M.text, fontSize: 12, padding: "6px 8px", fontFamily: "'IBM Plex Sans', sans-serif", resize: "vertical", outline: "none", lineHeight: 1.5 }} />
                                                            : <span onClick={() => updateReq(r.id, "editing", true)} style={{ fontSize: 13, color: r.on ? M.text : M.ov0, lineHeight: 1.5, display: "block", cursor: "text", padding: "2px 0" }}>{r.text || <span style={{ color: M.ov0, fontStyle: "italic" }}>Click to edit...</span>}</span>
                                                        }
                                                    </td>
                                                    <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                                                        {r.editing
                                                            ? <input type="number" value={r.page} onChange={e => updateReq(r.id, "page", parseInt(e.target.value) || 1)} style={{ width: 52, background: M.s1, border: `1px solid ${M.s2}`, borderRadius: 4, color: M.text, fontSize: 12, padding: "4px 6px", fontFamily: "'JetBrains Mono', monospace", outline: "none" }} />
                                                            : <span style={{ fontSize: 12, color: M.ov1, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer" }} onClick={() => updateReq(r.id, "editing", true)}>p.{r.page}</span>
                                                        }
                                                    </td>
                                                    <td style={{ padding: "10px 14px", width: 36, textAlign: "center" }}>
                                                        <button onClick={() => deleteReq(r.id)} style={{ background: "none", border: "none", color: M.ov0, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "2px 4px", borderRadius: 4 }} onMouseEnter={e => e.target.style.color = M.red} onMouseLeave={e => e.target.style.color = M.ov0}>×</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div onClick={addReq} style={{ padding: "11px 14px", borderTop: `1px solid ${M.s1}33`, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: M.ov0, fontSize: 12, transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = M.s1} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                        <span style={{ fontSize: 16 }}>+</span><span>Add requirement</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })()}

                    {/* VALIDATION */}
                    {page === "validation" && (
                        <div style={{ maxWidth: 680 }}>
                            <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>Step 4</p>
                            <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Validating Proposals</h1>
                            <p style={{ fontSize: 13, color: M.ov1, marginBottom: 24 }}>Matching vendor proposals against your {checkedReqs.length} confirmed requirements.</p>
                            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                                {VENDORS.map((v, i) => {
                                    const done = logDone || logLines.length > (i + 1) * 6
                                    const active = !logDone && logLines.length > i * 6 && logLines.length <= (i + 1) * 6
                                    const col = done ? M.teal : active ? M.mauve : M.ov0
                                    return (
                                        <div key={v.name} style={{ flex: 1, background: M.s0, border: `1px solid ${done ? M.teal + "44" : active ? M.mauve + "44" : M.s1}`, borderRadius: 8, padding: "10px 14px" }}>
                                            <div style={{ fontSize: 11, color: col, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>{done ? "✓" : active ? "›" : "·"} {v.name.split(" ")[0]}</div>
                                            <div style={{ height: 2, background: M.s1, borderRadius: 1, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: done ? "100%" : active ? "60%" : "0%", background: col, borderRadius: 1, transition: "width 0.5s" }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div ref={logRef} style={{ background: M.crust, border: `1px solid ${M.s1}`, borderRadius: 10, padding: "20px 24px", height: 320, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.9, marginBottom: 20 }}>
                                {logLines.map((line, i) => {
                                    const isLast = i === logLines.length - 1 && !logDone
                                    const isDone = line.startsWith("✓")
                                    return (
                                        <div key={i} style={{ display: "flex", gap: 10 }}>
                                            <span style={{ color: isLast ? M.yell : isDone ? `${M.teal}80` : M.s2, flexShrink: 0 }}>{isLast ? "›" : isDone ? "✓" : "·"}</span>
                                            <span style={{ color: isLast ? M.yell : isDone ? M.teal : M.sub0 }}>{line}</span>
                                        </div>
                                    )
                                })}
                                {!logDone && <div style={{ display: "flex", gap: 10 }}><span style={{ color: M.s2 }}>›</span><span style={{ color: M.s2 }}>_</span></div>}
                                {logDone && <div style={{ marginTop: 8, color: M.green, fontWeight: 500 }}>All vendors validated successfully.</div>}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 12, color: M.ov0 }}>{logDone ? `${LOG_VALIDATION.length} steps completed` : `${logLines.length} of ${LOG_VALIDATION.length} steps...`}</span>
                                <Btn onClick={() => go("dashboard")} disabled={!logDone}>View Dashboard →</Btn>
                            </div>
                        </div>
                    )}

                    {/* DASHBOARD */}
                    {page === "dashboard" && (() => {
                        const summaries = VENDORS.map(v => ({ name: v.name, ...vendorSummary(v.name, checkedReqs) }))
                        return (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                                    <div>
                                        <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>Results</p>
                                        <h1 style={{ fontSize: 22, fontWeight: 600 }}>Compliance Dashboard</h1>
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <Btn variant="export">↓ Export CSV</Btn>
                                        <Btn variant="export">↓ Export PDF</Btn>
                                    </div>
                                </div>

                                {/* Vendor cards */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
                                    {summaries.map(s => {
                                        const v = VENDORS.find(x => x.name === s.name)
                                        const isOpen = toneOpen[s.name]
                                        return (
                                            <div key={s.name} style={{ background: M.s0, border: `1px solid ${M.s1}`, borderRadius: 10, padding: 20, display: "flex", flexDirection: "column" }}>
                                                <p style={{ fontSize: 11, color: M.ov0, marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</p>
                                                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                                                    <span style={{ fontSize: 28, fontWeight: 600, color: s.score >= 75 ? M.green : s.score >= 60 ? M.yell : M.red, fontFamily: "'JetBrains Mono', monospace" }}>{s.score}%</span>
                                                    <span style={{ fontSize: 11, color: M.ov0 }}>compliance</span>
                                                </div>
                                                <div style={{ height: 4, background: M.s1, borderRadius: 2, marginBottom: 16, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: `${s.score}%`, background: s.score >= 75 ? M.green : s.score >= 60 ? M.yell : M.red, borderRadius: 2 }} />
                                                </div>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 0", marginBottom: 16 }}>
                                                    {[
                                                        { label: "Met", val: s.met, color: M.green },
                                                        { label: "Partial", val: s.partial, color: M.yell },
                                                        { label: "Missing", val: s.missing, color: M.red },
                                                        { label: "Avg. confidence", val: `${s.avgConf}%`, color: s.avgConf >= 70 ? M.green : s.avgConf >= 50 ? M.yell : M.ov1 },
                                                        { label: "Risk flags", val: s.flags, color: M.peach },
                                                    ].map(({ label, val, color }) => (
                                                        <div key={label}>
                                                            <div style={{ fontSize: 10, color: M.ov0, marginBottom: 2, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
                                                            <div style={{ fontSize: 14, fontWeight: 500, color, fontFamily: "'JetBrains Mono', monospace" }}>{val}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ borderTop: `1px solid ${M.s1}`, paddingTop: 12, marginBottom: 12 }}>
                                                    <button className="tone-toggle" onClick={() => setToneOpen(prev => ({ ...prev, [s.name]: !prev[s.name] }))}
                                                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 4, transition: "background 0.15s" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                            <span style={{ fontSize: 10, color: M.ov0, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tone</span>
                                                            <TonePill tone={s.tone} />
                                                        </div>
                                                        <span style={{ fontSize: 12, color: M.ov0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
                                                    </button>
                                                    {isOpen && (
                                                        <div style={{ marginTop: 8, padding: "10px 12px", background: M.mantle, borderRadius: 6, border: `1px solid ${M.s1}` }}>
                                                            <p style={{ fontSize: 12, color: M.sub1, lineHeight: 1.55 }}>{s.toneSummary}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${M.s1}` }}>
                                                    <Badge label={`${s.risk} Risk`} color={RISK_COLOR[s.risk]} />
                                                    <button onClick={() => { setRiskVendor(s.name); go("risk") }} style={{ fontSize: 12, color: M.blue, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'IBM Plex Sans', sans-serif" }}>View report →</button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Mapping table */}
                                <div style={{ background: M.s0, border: `1px solid ${M.s1}`, borderRadius: 10, overflow: "auto" }}>
                                    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${M.s1}`, display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 500 }}>Requirement Mapping</span>
                                        <span style={{ fontSize: 11, color: M.ov0 }}>— click any cell to see the matched statement</span>
                                    </div>
                                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${M.s1}` }}>
                                                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: M.ov0, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>Requirement</th>
                                                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, color: M.ov0, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, whiteSpace: "nowrap" }}>Category</th>
                                                {VENDORS.map(v => <th key={v.name} style={{ padding: "10px 12px", textAlign: "center", fontSize: 11, color: M.ov0, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, whiteSpace: "nowrap" }}>{v.name.split(" ")[0]}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {checkedReqs.map(r => (
                                                <tr key={r.id} style={{ borderBottom: `1px solid ${M.s1}22` }}>
                                                    <td style={{ padding: "10px 16px", fontSize: 12, color: M.sub1, maxWidth: 320, lineHeight: 1.45 }}>{r.text}</td>
                                                    <td style={{ padding: "10px 12px" }}><Badge label={r.cat} color={CAT_COLORS[r.cat]} /></td>
                                                    {VENDORS.map(v => <StatusCell key={v.name} vendor={v.name} reqId={r.id} onClick={(vn, rId) => setDeepDive({ vendor: vn, reqId: rId })} />)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    })()}

                    {/* RISK REPORT */}
                    {page === "risk" && riskVendor && (() => {
                        const v = VENDORS.find(x => x.name === riskVendor)
                        const flags = FLAGS[riskVendor] || []
                        const toneCol = v.tone >= 7 ? M.green : v.tone >= 5 ? M.yell : M.red
                        return (
                            <div style={{ maxWidth: 720 }}>
                                <button onClick={() => go("dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: M.ov1, background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: "'IBM Plex Sans', sans-serif" }}>← Back to Dashboard</button>
                                <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>Risk Report</p>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                                    <h1 style={{ fontSize: 22, fontWeight: 600 }}>{riskVendor}</h1>
                                    <Badge label={`${v.risk} Risk`} color={RISK_COLOR[v.risk]} />
                                </div>
                                <div style={{ background: M.s0, border: `1px solid ${toneCol}33`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                        <span style={{ fontSize: 12, color: M.sub0, fontWeight: 500 }}>Tone & Language</span>
                                        <TonePill tone={v.tone} />
                                    </div>
                                    <div style={{ height: 6, background: M.s1, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                                        <div style={{ height: "100%", width: `${v.tone * 10}%`, background: toneCol, borderRadius: 3 }} />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                        <span style={{ fontSize: 10, color: M.ov0 }}>Vague</span>
                                        <span style={{ fontSize: 10, color: M.ov0 }}>Precise</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: M.sub1, lineHeight: 1.6, borderTop: `1px solid ${M.s1}`, paddingTop: 12 }}>{v.toneSummary}</p>
                                </div>
                                <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>Risk Flags ({flags.length})</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {flags.sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.sev] - { High: 0, Medium: 1, Low: 2 }[b.sev])).map((f, i) => (
                                        <div key={i} style={{ background: M.s0, border: `1px solid ${SEV_COLOR[f.sev]}33`, borderLeft: `3px solid ${SEV_COLOR[f.sev]}`, borderRadius: 8, padding: 16 }}>
                                            <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                                                <Badge label={`Impact: ${f.sev}`} color={SEV_COLOR[f.sev]} />
                                                <Badge label={`Likelihood: ${f.likelihood}`} color={RISK_COLOR[f.likelihood]} />
                                                <Badge label={f.type} color={M.ov1} />
                                                <span style={{ fontSize: 11, color: M.ov0, marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>p.{f.page}</span>
                                            </div>
                                            <p style={{ fontSize: 13, color: M.sub1, marginBottom: 8, lineHeight: 1.5, fontStyle: "italic" }}>"{f.text}"</p>
                                            <p style={{ fontSize: 12, color: M.ov1, lineHeight: 1.5 }}>{f.impact}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })()}

                </main>
            </div>

            {/* DEEP DIVE MODAL */}
            {deepDive && (() => {
                const r = REQS.find(x => x.id === deepDive.reqId)
                const res = RESULTS[deepDive.vendor]?.[deepDive.reqId]
                return (
                    <div onClick={() => setDeepDive(null)} style={{ position: "fixed", inset: 0, background: "rgba(17,17,27,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 32 }}>
                        <div onClick={e => e.stopPropagation()} style={{ background: M.mantle, border: `1px solid ${M.s1}`, borderRadius: 12, padding: 28, maxWidth: 560, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                                <div>
                                    <p style={{ fontSize: 11, color: M.ov0, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>Deep Dive — {deepDive.vendor}</p>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <Badge label={r?.cat} color={CAT_COLORS[r?.cat]} />
                                        <span style={{ fontSize: 11, color: M.ov0, fontFamily: "'JetBrains Mono', monospace" }}>RFP p.{r?.page}</span>
                                    </div>
                                </div>
                                <button onClick={() => setDeepDive(null)} style={{ background: "none", border: "none", color: M.ov0, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
                            </div>
                            <p style={{ fontSize: 14, color: M.text, lineHeight: 1.6, marginBottom: 20 }}>{r?.text}</p>
                            <div style={{ borderTop: `1px solid ${M.s1}`, paddingTop: 16, marginBottom: 16 }}>
                                <p style={{ fontSize: 11, color: M.ov0, marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{res?.s === "Met" ? "Matched statement" : "Closest section"}</p>
                                {res?.excerpt
                                    ? <div style={{ background: res?.s === "Met" ? `${M.green}12` : M.s0, border: res?.s === "Met" ? `1px solid ${M.green}28` : "none", borderRadius: 6, padding: 14, fontSize: 13, color: M.sub1, lineHeight: 1.6, fontStyle: "italic" }}>
                                        "{res.excerpt}"
                                        <span style={{ fontSize: 11, color: M.ov0, fontStyle: "normal", display: "block", marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>p.{res.page}</span>
                                    </div>
                                    : <div style={{ background: M.s0, borderRadius: 6, padding: 14, fontSize: 13, color: M.ov0 }}>No related section found in this document.</div>
                                }
                            </div>
                            {res?.why && (
                                <div style={{ background: `${STATUS_COLOR[res.s]}10`, border: `1px solid ${STATUS_COLOR[res.s]}28`, borderRadius: 6, padding: 14, marginBottom: 16 }}>
                                    <p style={{ fontSize: 11, color: STATUS_COLOR[res.s], marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>{res.s === "Partial" ? "Why it's partial" : "Why it's missing"}</p>
                                    <p style={{ fontSize: 13, color: M.sub1, lineHeight: 1.5 }}>{res.why}</p>
                                </div>
                            )}
                            {res && (
                                <div style={{ borderTop: `1px solid ${M.s1}`, paddingTop: 16, marginBottom: 16 }}>
                                    <p style={{ fontSize: 11, color: M.ov0, marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>Confidence Breakdown</p>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                                        <div style={{ background: M.s0, borderRadius: 6, padding: "10px 14px" }}>
                                            <p style={{ fontSize: 10, color: M.ov0, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>STATUS</p>
                                            <Badge label={res.s} color={STATUS_COLOR[res.s]} />
                                        </div>
                                        <div style={{ background: M.s0, borderRadius: 6, padding: "10px 14px" }}>
                                            <p style={{ fontSize: 10, color: M.ov0, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>PROBE CONFIDENCE</p>
                                            <span style={{ fontSize: 20, fontWeight: 600, color: res.c >= 70 ? M.green : res.c >= 50 ? M.yell : M.ov1, fontFamily: "'JetBrains Mono', monospace" }}>{res.c > 0 ? `${res.c}%` : "—"}</span>
                                        </div>
                                    </div>
                                    {res.eq && res.c > 0 && (
                                        <div style={{ background: M.s0, borderRadius: 6, padding: "10px 14px", marginBottom: 12 }}>
                                            <p style={{ fontSize: 10, color: M.ov0, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>EVIDENCE QUALITY</p>
                                            <p style={{ fontSize: 12, color: M.sub1, lineHeight: 1.55 }}>{res.eq}</p>
                                        </div>
                                    )}
                                    <div style={{ background: M.s0, borderRadius: 6, padding: "10px 14px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                            <p style={{ fontSize: 10, color: M.ov0, fontFamily: "'JetBrains Mono', monospace" }}>RETRIEVAL SIMILARITY</p>
                                            <span style={{ fontSize: 12, fontWeight: 500, color: res.cos >= 0.7 ? M.teal : res.cos >= 0.5 ? M.yell : M.ov1, fontFamily: "'JetBrains Mono', monospace" }}>{res.cos.toFixed(2)}</span>
                                        </div>
                                        <div style={{ height: 4, background: M.s1, borderRadius: 2, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${res.cos * 100}%`, background: res.cos >= 0.7 ? M.teal : res.cos >= 0.5 ? M.yell : M.ov1, borderRadius: 2 }} />
                                        </div>
                                        <p style={{ fontSize: 10, color: M.ov0, marginTop: 6 }}>{res.cos >= 0.7 ? "Strong semantic match" : res.cos >= 0.5 ? "Borderline match — reviewed by LLM" : "Weak match — below threshold"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })()}
        </>
    )
}