// In dev, Vite proxies /api to the Flask backend (see vite.config.js).
// For a deployed backend, set VITE_API_BASE to its URL at build time.
const API_BASE = import.meta.env.VITE_API_BASE || ''

const RATE_LIMITED = 'Too many requests — slow down for a few seconds.'

export async function fetchQuestions() {
  const res = await fetch(`${API_BASE}/api/quiz-questions`)
  if (res.status === 429) throw new Error(RATE_LIMITED)
  if (!res.ok) throw new Error(`Failed to load questions (${res.status})`)
  return res.json()
}

export async function analyze(name, responses) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, responses }),
  })
  if (res.status === 429) throw new Error(RATE_LIMITED)
  if (!res.ok) throw new Error(`Analysis failed (${res.status})`)
  return res.json()
}
