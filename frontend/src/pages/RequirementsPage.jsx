import { useState } from "react"
import { M } from "../constants/colors"
import { CAT_COLORS } from "../constants/statusMaps"
import Btn from "../components/ui/Btn"
import Badge from "../components/ui/Badge"
import useRequirements from "../hooks/useRequirements"
import { patchRequirement } from "../api/requirements"

const CATS = ["All", "Technical", "Legal", "Financial", "Operational"]

export default function RequirementsPage({ go, sessionId }) {
    const { reqs, setReqs, loading, updateReq, addReq, deleteReq } =
        useRequirements(sessionId)

    const [catFilter, setCatFilter] = useState("All")
    const [confirming, setConfirming] = useState(false)
    const [error, setError] = useState(null)

    const checkedReqs = reqs.filter((r) => r.confirmed)
    const filteredReqs = catFilter === "All"
        ? reqs
        : reqs.filter((r) => r.category === catFilter)

    async function handleAddRow() {
        await addReq({
            category: "Technical",
            requirement_text: "",
            source_page: 1,
            confirmed: true,
        })
        setReqs((prev) =>
            prev.map((r, i) =>
                i === prev.length - 1 ? { ...r, editing: true } : r
            )
        )
    }

    async function handleConfirm() {
        setConfirming(true)
        setError(null)
        try {
            // Mark all checked rows confirmed = true
            // and unchecked rows confirmed = false
            await Promise.all(
                reqs.map((r) =>
                    patchRequirement(sessionId, r.req_id, {
                        confirmed: r.confirmed,
                    })
                )
            )
            go("validation")
        } catch (err) {
            setError(err.message)
            setConfirming(false)
        }
    }

    if (loading) {
        return (
            <div style={{ color: M.ov1, fontSize: 13 }}>
                Loading requirements...
            </div>
        )
    }

    return (
        <div>
            <p style={{
                fontSize: 11, color: M.ov0, letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 6,
                fontFamily: "'JetBrains Mono', monospace",
            }}>
                Step 3
            </p>

            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 24,
            }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
                        Review Requirements
                    </h1>
                    <p style={{ fontSize: 13, color: M.ov1 }}>
                        Edit, add, or remove requirements. Only checked rows will be validated.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={handleAddRow} variant="ghost">+ Add Row</Btn>
                    <Btn
                        onClick={handleConfirm}
                        disabled={checkedReqs.length === 0 || confirming}
                    >
                        {confirming
                            ? "Saving..."
                            : `Confirm ${checkedReqs.length} →`}
                    </Btn>
                </div>
            </div>

            {/* Stats strip */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                {[
                    { label: "Total", val: reqs.length, color: M.sub1 },
                    { label: "Selected", val: checkedReqs.length, color: M.mauve },
                    { label: "Skipped", val: reqs.length - checkedReqs.length, color: M.ov1 },
                ].map(({ label, val, color }) => (
                    <div key={label} style={{
                        background: M.s0, border: `1px solid ${M.s1}`,
                        borderRadius: 6, padding: "8px 16px",
                        display: "flex", gap: 8, alignItems: "center",
                    }}>
                        <span style={{
                            fontSize: 18, fontWeight: 600, color,
                            fontFamily: "'JetBrains Mono', monospace",
                        }}>
                            {val}
                        </span>
                        <span style={{ fontSize: 11, color: M.ov0 }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Category filter */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                {CATS.map((c) => (
                    <button
                        key={c}
                        onClick={() => setCatFilter(c)}
                        style={{
                            padding: "5px 14px", borderRadius: 20, fontSize: 12,
                            cursor: "pointer", transition: "all 0.15s",
                            border: catFilter === c
                                ? `1px solid ${M.mauve}` : `1px solid ${M.s1}`,
                            background: catFilter === c ? `${M.mauve}22` : "transparent",
                            color: catFilter === c ? M.mauve : M.ov1,
                            fontFamily: "'IBM Plex Sans', sans-serif",
                        }}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {error && (
                <p style={{
                    fontSize: 12, color: M.red, marginBottom: 16,
                    padding: "8px 12px", background: `${M.red}12`,
                    borderRadius: 6, border: `1px solid ${M.red}33`,
                }}>
                    {error}
                </p>
            )}

            {/* Table */}
            <div style={{
                background: M.s0, border: `1px solid ${M.s1}`,
                borderRadius: 10, overflow: "hidden",
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${M.s1}` }}>
                            {["", "ID", "Category", "Requirement", "Page", ""].map((h, i) => (
                                <th key={i} style={{
                                    padding: "11px 14px", textAlign: "left",
                                    fontSize: 11, fontWeight: 500, color: M.ov0,
                                    letterSpacing: "0.08em", textTransform: "uppercase",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    whiteSpace: "nowrap",
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReqs.map((r) => (
                            <tr
                                key={r.req_id}
                                style={{ borderBottom: `1px solid ${M.s1}33` }}
                            >
                                {/* Checkbox */}
                                <td style={{ padding: "10px 14px", width: 36 }}>
                                    <input
                                        type="checkbox"
                                        checked={r.confirmed}
                                        onChange={() =>
                                            updateReq(r.req_id, "confirmed", !r.confirmed)
                                        }
                                        style={{ accentColor: M.mauve, cursor: "pointer" }}
                                    />
                                </td>

                                {/* ID */}
                                <td style={{
                                    padding: "10px 14px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 11, color: M.ov1, whiteSpace: "nowrap",
                                }}>
                                    {r.req_id}
                                </td>

                                {/* Category */}
                                <td style={{ padding: "10px 14px", minWidth: 130 }}>
                                    {r.editing ? (
                                        <select
                                            value={r.category}
                                            onChange={(e) =>
                                                updateReq(r.req_id, "category", e.target.value)
                                            }
                                            style={{
                                                background: M.s1, border: `1px solid ${M.s2}`,
                                                borderRadius: 4, color: M.text,
                                                fontSize: 12, padding: "4px 8px",
                                                fontFamily: "'IBM Plex Sans', sans-serif",
                                            }}
                                        >
                                            {["Technical", "Legal", "Financial", "Operational"].map(
                                                (c) => <option key={c}>{c}</option>
                                            )}
                                        </select>
                                    ) : (
                                        <span
                                            onClick={() =>
                                                updateReq(r.req_id, "editing", true)
                                            }
                                            style={{ cursor: "pointer" }}
                                        >
                                            <Badge
                                                label={r.category}
                                                color={CAT_COLORS[r.category]}
                                            />
                                        </span>
                                    )}
                                </td>

                                {/* Requirement text */}
                                <td style={{ padding: "8px 14px", maxWidth: 420 }}>
                                    {r.editing ? (
                                        <textarea
                                            value={r.requirement_text}
                                            onChange={(e) =>
                                                updateReq(r.req_id, "requirement_text", e.target.value)
                                            }
                                            onBlur={() => updateReq(r.req_id, "editing", false)}
                                            autoFocus
                                            rows={2}
                                            style={{
                                                width: "100%", background: M.s1,
                                                border: `1px solid ${M.mauve}66`,
                                                borderRadius: 4, color: M.text,
                                                fontSize: 12, padding: "6px 8px",
                                                fontFamily: "'IBM Plex Sans', sans-serif",
                                                resize: "vertical", outline: "none",
                                                lineHeight: 1.5,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            onClick={() => updateReq(r.req_id, "editing", true)}
                                            style={{
                                                fontSize: 13,
                                                color: r.confirmed ? M.text : M.ov0,
                                                lineHeight: 1.5, display: "block",
                                                cursor: "text", padding: "2px 0",
                                            }}
                                        >
                                            {r.requirement_text || (
                                                <span style={{ color: M.ov0, fontStyle: "italic" }}>
                                                    Click to edit...
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </td>

                                {/* Page */}
                                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                                    {r.editing ? (
                                        <input
                                            type="number"
                                            value={r.source_page}
                                            onChange={(e) =>
                                                updateReq(
                                                    r.req_id,
                                                    "source_page",
                                                    parseInt(e.target.value) || 1
                                                )
                                            }
                                            style={{
                                                width: 52, background: M.s1,
                                                border: `1px solid ${M.s2}`, borderRadius: 4,
                                                color: M.text, fontSize: 12, padding: "4px 6px",
                                                fontFamily: "'JetBrains Mono', monospace",
                                                outline: "none",
                                            }}
                                        />
                                    ) : (
                                        <span
                                            onClick={() => updateReq(r.req_id, "editing", true)}
                                            style={{
                                                fontSize: 12, color: M.ov1,
                                                fontFamily: "'JetBrains Mono', monospace",
                                                cursor: "pointer",
                                            }}
                                        >
                                            p.{r.source_page}
                                        </span>
                                    )}
                                </td>

                                {/* Delete */}
                                <td style={{
                                    padding: "10px 14px", width: 36, textAlign: "center",
                                }}>
                                    <button
                                        onClick={() => deleteReq(r.req_id)}
                                        onMouseEnter={(e) => e.target.style.color = M.red}
                                        onMouseLeave={(e) => e.target.style.color = M.ov0}
                                        style={{
                                            background: "none", border: "none",
                                            color: M.ov0, cursor: "pointer",
                                            fontSize: 16, lineHeight: 1,
                                            padding: "2px 4px", borderRadius: 4,
                                        }}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Add row footer */}
                <div
                    onClick={handleAddRow}
                    onMouseEnter={(e) =>
                        e.currentTarget.style.background = M.s1
                    }
                    onMouseLeave={(e) =>
                        e.currentTarget.style.background = "transparent"
                    }
                    style={{
                        padding: "11px 14px",
                        borderTop: `1px solid ${M.s1}33`,
                        display: "flex", alignItems: "center", gap: 8,
                        cursor: "pointer", color: M.ov0, fontSize: 12,
                        transition: "background 0.15s",
                    }}
                >
                    <span style={{ fontSize: 16 }}>+</span>
                    <span>Add requirement</span>
                </div>
            </div>
        </div>
    )
}