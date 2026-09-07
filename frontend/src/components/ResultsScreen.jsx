import { styles } from '../styles.js'

export default function ResultsScreen({ result, onRestart }) {
  const { name, primary_recommendation, confidence, recommendations } = result

  const desc = primary_recommendation.description || ''
  const descLower = desc.charAt(0).toLowerCase() + desc.slice(1)

  if (primary_recommendation.score <= 0) {
    return (
      <div style={styles.phone}>
        <div style={styles.kicker}>{name ? `${name}, no clear match` : 'no clear match'}</div>

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
      <div style={styles.kicker}>{name ? `${name}, your match is` : 'your match is'}</div>

      <div style={{ ...styles.resultCard, marginTop: 16 }}>
        <div style={styles.resultStatement}>You are a {primary_recommendation.name} person</div>
        {descLower && <div style={styles.resultDesc}>that {descLower}</div>}
        <div style={styles.confidence}>Confidence {confidence}%</div>
      </div>

      <div style={styles.sectionHeading}>Learning roadmap</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {recommendations.map((step, i) => (
          <li key={i} style={styles.roadmapItem}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            {step}
          </li>
        ))}
      </ul>

      <button style={{ ...styles.primaryButton, marginTop: 24 }} onClick={onRestart}>
        Retake quiz
      </button>
    </div>
  )
}
