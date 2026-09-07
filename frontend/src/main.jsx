import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const globalStyle = document.createElement('style')
globalStyle.textContent = `
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; background: #b7d38c; font-family: 'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace; }
`
document.head.appendChild(globalStyle)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
