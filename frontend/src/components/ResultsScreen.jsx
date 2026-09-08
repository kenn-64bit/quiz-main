import { useState } from 'react'
import { styles } from '../styles.js'

export default function ResultsScreen({ result, onRestart }) {
  const {
    name,
    primary_recommendation,
    alternative_recommendations = [],
    confidence,
    close_call,
    recommendations,
  } = result
  const [showReasoning, setShowReasoning] = useState(false)

  const desc = primary_recommendation.description || ''
  const descLower = desc.charAt(0).toLowerCase() + desc.slice(1)
  const reasoning = Array.isArray(result.reasoning) ? result.reasoning : []
  const runnerUp = alternative_recommendations[0]
  const isCloseCall = close_call && !!runnerUp

  if (primary_recommendation.score <= 0) {
    return (
      <div style={styles.phone}>
        <div style={styles.kicker}>› {name ? `${name}, no clear match` : 'no clear match'}</div>

        <div style={{ ...styles.resultCard, marginTop: 16 }}>
          <div style={styles.resultStatement}>Not enough to go on</div>
          <div style={styles.resultDesc}>
            Your answers didn't lean far enough one way or the other for a field to
            stand out. Retake the quiz and let some statements pull stronger
            agreement or disagreement than the rest.
          </div>
        </div>

        <button style={{ ...styles.primaryButton, marginTop: 24 }} onClick={onRestart}>
          Retake quiz
        </button>
      </div>
    )
  }

  // Top matches, highest first — primary is always index 0 of this list.
  const breakdown = [primary_recommendation, ...alternative_recommendations]
  const topScore = primary_recommendation.score || 1

  return (
    <div style={styles.phone}>
      <div style={styles.kicker}>
        › {name ? `${name}, ` : ''}
        {isCloseCall ? 'your top two are close' : 'your match is'}
      </div>

      <div style={{ ...styles.resultCard, marginTop: 16 }}>
        {isCloseCall ? (
          <>
            <div style={styles.resultStatement}>
              {primary_recommendation.name} or {runnerUp.name}
            </div>
            <div style={styles.resultDesc}>
              Your answers point at both almost equally. We've led with{' '}
              {primary_recommendation.name}, but take {runnerUp.name} just as
              seriously — {runnerUp.description}
            </div>
          </>
        ) : (
          <>
            <div style={styles.resultStatement}>You are a {primary_recommendation.name} person</div>
            {descLower && <div style={styles.resultDesc}>that {descLower}</div>}
          </>
        )}
        <div style={styles.confidence}>
          <span style={styles.chip}>Confidence {confidence}%</span>
        </div>
      </div>

      <div style={styles.sectionHeading}>📊 How the fields scored</div>
      <div>
        {breakdown.map((f) => {
          const pct = Math.max(0, (Math.max(0, f.score) / topScore) * 100)
          return (
            <div key={f.field_id}>
              <div style={styles.barLabelRow}>
                <span>{f.name}</span>
                <span>{f.score}</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div style={styles.sectionHeading}>🔋 Learning roadmap</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {recommendations.map((step, i) => (
          <li key={i} style={styles.roadmapItem}>
            <span style={{ position: 'absolute', left: 0, color: styles.theme.green }}>›</span>
            {step}
          </li>
        ))}
      </ul>

      {reasoning.length > 0 && (
        <button
          style={{ ...styles.secondaryButton, marginTop: 20, width: '100%' }}
          onClick={() => setShowReasoning(true)}
        >
          🧠 How we got here
        </button>
      )}

      <button style={{ ...styles.primaryButton, marginTop: 12 }} onClick={onRestart}>
        Retake quiz
      </button>

      {showReasoning && (
        <div style={styles.modalOverlay} onClick={() => setShowReasoning(false)}>
          <div
            style={{ ...styles.modalCard, textAlign: 'left', maxWidth: 380 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ ...styles.sectionHeading, flexShrink: 0 }}>🧠 How we got here</div>
            <ul style={{ ...styles.modalScroll, marginTop: 4 }}>
              {reasoning.map((line, i) => (
                <li key={i} style={styles.roadmapItem}>
                  <span style={{ position: 'absolute', left: 0, color: styles.theme.green }}>›</span>
                  {line}
                </li>
              ))}
            </ul>
            <div style={styles.modalActions}>
              <button
                style={{ ...styles.primaryButton, width: 'auto', flex: 1 }}
                onClick={() => setShowReasoning(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
