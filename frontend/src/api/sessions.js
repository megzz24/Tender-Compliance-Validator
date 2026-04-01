import { get, post } from "./client"

export const createSession = (name) =>
    post("/api/sessions", { name })

export const getSession = (id) =>
    get(`/api/sessions/${id}`)

export const getSessionByName = (name) =>
    get(`/api/sessions/by-name/${encodeURIComponent(name)}`)