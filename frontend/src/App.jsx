import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import useSession from "./hooks/useSession";
import UploadPage from "./pages/UploadPage";
import PipelinePage from "./pages/PipelinePage";
import RequirementsPage from "./pages/RequirementsPage";
// import ValidationPage  from "./pages/ValidationPage"   // Feature 2
// import DashboardPage   from "./pages/DashboardPage"    // Feature 2
// import RiskReportPage  from "./pages/RiskReportPage"   // Feature 3

const STEP_MAP = {
    upload: 0,
    pipeline: 1,
    requirements: 2,
    validation: 3,
    dashboard: 4,
    risk: 4,
};

export default function App() {
    const [page, setPage] = useState("upload");
    const [vendorCount, setVendorCount] = useState(0);
    // eslint-disable-next-line no-unused-vars
    const [riskVendor, setRiskVendor] = useState(null);
    const { sessionId, setSessionId, sessionName, createSession } = useSession();

    const go = (p) => setPage(p);
    const step = STEP_MAP[page] ?? 0;

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: "#cdd6f4",
                background: "#1e1e2e",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #181825; }
        ::-webkit-scrollbar-thumb { background: #45475a; border-radius: 3px; }
        tr:hover td { background: #31324422 !important; }
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
                        onSessionId={(id) => setSessionId(id)}
                        createSession={createSession}
                        setVendorCount={setVendorCount}
                    />
                )}

                {page === "pipeline" && <PipelinePage go={go} sessionId={sessionId} />}

                {page === "requirements" && (
                    <RequirementsPage go={go} sessionId={sessionId} />
                )}

                {/* Uncomment as features are built */}
                {/* {page === "validation" && <ValidationPage go={go} sessionId={sessionId} />} */}
                {/* {page === "dashboard" && <DashboardPage go={go} sessionId={sessionId} setRiskVendor={setRiskVendor} />} */}
                {/* {page === "risk" && <RiskReportPage go={go} sessionId={sessionId} riskVendor={riskVendor} />} */}
            </main>
        </div>
    );
}
