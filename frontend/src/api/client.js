const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

async function request(method, path, body = null) {
    const options = {
        method,
        headers: { "Content-Type": "application/json" },
    }

    if (body !== null) {
        options.body = JSON.stringify(body)
    }

    const res = await fetch(`${BASE}${path}`, options)

    if (!res.ok) {
        let message = `Request failed: ${res.status}`
        try {
            const err = await res.json()
            message = err.detail || err.message || message
        // eslint-disable-next-line no-unused-vars
        } catch (_) { /* empty */ } 
        throw new Error(message)
    }

    // 204 No Content
    if (res.status === 204) return null

    return res.json()
}

export const get = (path) => request("GET", path)
export const post = (path, body) => request("POST", path, body)
export const patch = (path, body) => request("PATCH", path, body)
export const del = (path) => request("DELETE", path)