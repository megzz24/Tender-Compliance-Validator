import { useState, useEffect } from "react"
import {
    getRequirements,
    patchRequirement,
    addRequirement,
    deleteRequirement,
} from "../api/requirements"

export default function useRequirements(sessionId) {
    const [reqs, setReqs] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!sessionId) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)
        getRequirements(sessionId)
            .then((data) => setReqs(data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [sessionId])

    const updateReq = async (id, field, value) => {
        // Optimistic update
        setReqs((prev) =>
            prev.map((r) => (r.req_id === id ? { ...r, [field]: value } : r))
        )
        // Sync to API in background
        const frontendOnlyFields = ["editing"]
        if (frontendOnlyFields.includes(field)) return

        try {
            await patchRequirement(sessionId, id, { [field]: value })
        } catch (err) {
            console.error("Failed to update requirement:", err)
        }
    }

    async function addReq(body) {
        const newReq = await addRequirement(sessionId, body)
        setReqs((prev) => [...prev, newReq])
        return newReq
    }

    function deleteReq(reqId) {
        // Optimistic remove
        setReqs((prev) => prev.filter((r) => r.req_id !== reqId))
        deleteRequirement(sessionId, reqId).catch((err) => {
            console.error("Failed to delete requirement:", err)
            getRequirements(sessionId).then(setReqs)
        })
    }

    return { reqs, setReqs, loading, updateReq, addReq, deleteReq }
}