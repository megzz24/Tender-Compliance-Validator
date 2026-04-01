const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

export async function uploadRFP(sessionId, file) {
    const form = new FormData()
    form.append("file", file)

    const res = await fetch(
        `${BASE}/api/sessions/${sessionId}/upload-rfp`,
        { method: "POST", body: form }
    )
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || "Failed to upload RFP")
    }
    return res.json()
}

export async function uploadVendors(sessionId, files) {
    const form = new FormData()
    for (const file of files) {
        form.append("files", file)
    }

    const res = await fetch(
        `${BASE}/api/sessions/${sessionId}/upload-vendors`,
        { method: "POST", body: form }
    )
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || "Failed to upload vendor files")
    }
    return res.json()
}