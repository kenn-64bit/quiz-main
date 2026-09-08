import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const globalStyle = document.createElement('style')
globalStyle.textContent = `
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; background: #b7d38c; font-family: 'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace; }

  /* Disable text/content selection everywhere ... */
  * {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }
  /* ... except where the user actually needs to type. */
  input, textarea {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }
  img, a { -webkit-user-drag: none; }
`
document.head.appendChild(globalStyle)

// --- Block right-click, drag, and copy on non-input content ----------------
const inField = (el) => !!(el && el.closest && el.closest('input, textarea'))
document.addEventListener('contextmenu', (e) => e.preventDefault())
document.addEventListener('dragstart', (e) => e.preventDefault())
for (const type of ['copy', 'cut', 'selectstart']) {
  document.addEventListener(type, (e) => {
    if (!inField(e.target)) e.preventDefault()
  })
}

// --- Throttle rapid clicks on any button / clickable control --------------
const CLICK_THROTTLE_MS = 500
let lastClickAt = 0
document.addEventListener(
  'click',
  (e) => {
    const control = e.target.closest(
      'button, [role="button"], [role="radio"], a[href]',
    )
    if (!control) return
    const now = Date.now()
    if (now - lastClickAt < CLICK_THROTTLE_MS) {
      e.preventDefault()
      e.stopImmediatePropagation()
      return
    }
    lastClickAt = now
  },
  true, // capture: run before React's handlers
)

// --- Rate-limit page refreshes -------------------------------------------
// If the page is reloaded too many times in a short window, hold it on a
// cooldown screen instead of rendering the app.
const REFRESH_KEY = 'refreshTimes'
const REFRESH_WINDOW_MS = 10_000
const REFRESH_MAX = 6
const REFRESH_COOLDOWN_MS = 8_000

function refreshGate() {
  let times
  try {
    times = JSON.parse(sessionStorage.getItem(REFRESH_KEY) || '[]')
  } catch {
    times = []
  }
  const now = Date.now()
  times = times.filter((t) => now - t < REFRESH_WINDOW_MS)
  times.push(now)
  try {
    sessionStorage.setItem(REFRESH_KEY, JSON.stringify(times))
  } catch {
    /* ignore */
  }
  return times.length <= REFRESH_MAX
}

const root = createRoot(document.getElementById('root'))

if (refreshGate()) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} else {
  root.render(
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        color: '#2f4f1f',
        fontFamily: "'Courier New', monospace",
      }}
    >
      <div>
        <div style={{ fontSize: 18, marginBottom: 8 }}>⏳ Slow down</div>
        <div>You refreshed too many times. One moment…</div>
      </div>
    </div>,
  )
  setTimeout(() => {
    try {
      sessionStorage.setItem(REFRESH_KEY, '[]')
    } catch {
      /* ignore */
    }
    window.location.reload()
  }, REFRESH_COOLDOWN_MS)
}
