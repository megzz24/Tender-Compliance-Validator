import { get, post, patch, del } from "./client"

export const getRequirements = (sessionId) =>
    get(`/api/sessions/${sessionId}/requirements`)

export const patchRequirement = (sessionId, reqId, body) =>
    patch(`/api/sessions/${sessionId}/requirements/${reqId}`, body)

export const addRequirement = (sessionId, body) =>
    post(`/api/sessions/${sessionId}/requirements`, body)

export const deleteRequirement = (sessionId, reqId) =>
    del(`/api/sessions/${sessionId}/requirements/${reqId}`)