import { useState } from 'react'
import { styles } from '../styles.js'

export default function ResultsScreen({ result, onRestart }) {
  const { name, primary_recommendation, confidence, recommendations } = result
  const [showReasoning, setShowReasoning] = useState(false)

  const desc = primary_recommendation.description || ''
  const descLower = desc.charAt(0).toLowerCase() + desc.slice(1)
  const reasoning = Array.isArray(result.reasoning) ? result.reasoning : []

  if (primary_recommendation.score <= 0) {
    return (
      <div style={styles.phone}>
        <div style={styles.kicker}>› {name ? `${name}, no clear match` : 'no clear match'}</div>

        <div style={{ ...styles.resultCard, marginTop: 16 }}>
          <div style={styles.resultStatement}>Not enough to go on</div>
          <div style={styles.resultDesc}>
            Your answers were mostly neutral, so no field stands out. Retake the quiz
            and answer with stronger agreement or disagreement.
          </div>
        </div>

        <button style={{ ...styles.primaryButton, marginTop: 24 }} onClick={onRestart}>
          Retake quiz
        </button>
      </div>
    )
  }

  return (
    <div style={styles.phone}>
      <div style={styles.kicker}>› {name ? `${name}, your match is` : 'your match is'}</div>

      <div style={{ ...styles.resultCard, marginTop: 16 }}>
        <div style={styles.resultStatement}>You are a {primary_recommendation.name} person</div>
        {descLower && <div style={styles.resultDesc}>that {descLower}</div>}
        <div style={styles.confidence}>
          <span style={styles.chip}>Confidence {confidence}%</span>
        </div>
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
            <div style={styles.sectionHeading}>🧠 How we got here</div>
            <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none' }}>
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
