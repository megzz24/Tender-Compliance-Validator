// eslint-disable-next-line no-unused-vars
import { useState, useEffect, useRef, useCallback } from "react"
import { getSession } from "../api/sessions"

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

export default function useSSE(sessionId, path, doneStatus) {
    const [lines, setLines] = useState([])
    const [done, setDone] = useState(false)
    const [error, setError] = useState(null)
    const esRef = useRef(null)
    const pollRef = useRef(null)

    useEffect(() => {
        if (!sessionId || !path) return

        // Reset state at start of new stream
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLines([])
        setDone(false)
        setError(null)

        const url = `${BASE}${path}`
        const es = new EventSource(url)
        esRef.current = es

        es.onmessage = (e) => {
            const text = e.data
            setLines((prev) => [...prev, text])

            if (text.includes("✅ Done") || text.includes("✅ All vendors")) {
                setDone(true)
                es.close()
            }
        }

        es.onerror = () => {
            es.close()
            setError("Stream disconnected — polling for status...")

            pollRef.current = setInterval(async () => {
                try {
                    const session = await getSession(sessionId)
                    if (session.status === doneStatus) {
                        setDone(true)
                        setError(null)
                        clearInterval(pollRef.current)
                    }
                } catch {
                    // keep polling
                }
            }, 5000)
        }

        return () => {
            es.close()
            if (pollRef.current) clearInterval(pollRef.current)
        }
    }, [sessionId, path, doneStatus])

    return { lines, done, error }
}