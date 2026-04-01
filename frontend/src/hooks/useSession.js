import { useState } from "react"
import { createSession as apiCreateSession } from "../api/sessions"

export default function useSession() {
    const [sessionId, setSessionId] = useState(null)
    const [sessionName, setSessionName] = useState("")

    async function createSession(name) {
        const session = await apiCreateSession(name)
        setSessionId(session.id)
        setSessionName(session.name)
        return session.id
    }

    return { sessionId, setSessionId, sessionName, createSession }
}