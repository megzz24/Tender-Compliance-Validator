/*
Top-level component. Holds `page` and `sessionId` state.
Renders Sidebar + the active page component.
Passes go(page) navigation function down as a prop.
*/
import { useState } from "react"
import Sidebar from "./components/layout/Sidebar"

// Pages imported as we build them — uncomment as you go
import UploadPage from "./pages/UploadPage"
// import PipelinePage      from "./pages/PipelinePage"
// import RequirementsPage  from "./pages/RequirementsPage"
// import ValidationPage    from "./pages/ValidationPage"
// import DashboardPage     from "./pages/DashboardPage"
// import RiskReportPage    from "./pages/RiskReportPage"

const STEP_MAP = {
    upload: 0,
    pipeline: 1,
    requirements: 2,
    validation: 3,
    dashboard: 4,
    risk: 4,
}

export default function App() {
    const [page, setPage] = useState("upload")
    const [sessionId, setSessionId] = useState(null)
    const [sessionName, setSessionName] = useState("")
    const [vendorCount, setVendorCount] = useState(0)
    const [riskVendor, setRiskVendor] = useState(null)

    const go = (p) => setPage(p)

    const step = STEP_MAP[page] ?? 0

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            fontFamily: "'IBM Plex Sans', sans-serif",
            color: "#cdd6f4",
            background: "#1e1e2e",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #181825; }
        ::-webkit-scrollbar-thumb { background: #45475a; border-radius: 3px; }
        `}</style>

            <Sidebar
                step={step}
                sessionName={sessionName}
                vendorCount={vendorCount}
                onNavigate={go}
            />

            <main style={{ flex: 1, padding: "36px 40px", overflow: "auto" }}>

                {page === "upload" && (
                    <UploadPage
                        go={go}
                        setSessionId={setSessionId}
                        setSessionName={setSessionName}
                        setVendorCount={setVendorCount}
                    />
                )}

                {/* Uncomment each page as you build it */}

                {/* {page === "pipeline" && (
            <PipelinePage go={go} sessionId={sessionId} />
        )} */}

                {/* {page === "requirements" && (
            <RequirementsPage go={go} sessionId={sessionId} />
        )} */}

                {/* {page === "validation" && (
            <ValidationPage go={go} sessionId={sessionId} />
        )} */}

                {/* {page === "dashboard" && (
            <DashboardPage
            go={go}
            sessionId={sessionId}
            setRiskVendor={setRiskVendor}
            />
        )} */}

                {/* {page === "risk" && (
            <RiskReportPage
            go={go}
            sessionId={sessionId}
            riskVendor={riskVendor}
            />
        )} */}

            </main>
        </div>
    )
}