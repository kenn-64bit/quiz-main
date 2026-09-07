import { styles } from '../styles.js'

export default function StartScreen({ name, setName, onStart, loading, error }) {
  const canStart = name.trim().length > 0 && !loading

  return (
    <div style={styles.phone}>
      <div style={styles.kicker}>› short quiz</div>
      <h1 style={styles.title}>★ Where does your code belong?</h1>

      <div style={styles.label}>Enter your name</div>
      <input
        style={styles.input}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && canStart && onStart()}
        placeholder="Your name"
        aria-label="Your name"
      />

      {error && <div style={styles.error}>{error}</div>}

      <button
        style={{ ...styles.primaryButton, ...(canStart ? {} : styles.disabledButton), marginTop: 24 }}
        onClick={onStart}
        disabled={!canStart}
      >
        {loading ? 'Loading…' : 'Start Quiz →'}
      </button>
    </div>
  )
}
