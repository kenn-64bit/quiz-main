import { styles } from '../styles.js'

export default function ResultsScreen({ result, onRestart }) {
  const { name, primary_recommendation, alternative_recommendations, confidence, all_scores, recommendations } = result

  const scoreEntries = Object.entries(all_scores).sort((a, b) => b[1] - a[1])
  const maxScore = Math.max(1, ...scoreEntries.map(([, s]) => s))
  const nameById = {
    ...Object.fromEntries(alternative_recommendations.map((a) => [a.field_id, a.name])),
    [primary_recommendation.field_id]: primary_recommendation.name,
  }

  return (
    <div style={styles.phone}>
      <div style={styles.kicker}>{name ? `${name}, your match is` : 'your match is'}</div>

      <div style={{ ...styles.resultCard, marginTop: 16 }}>
        <div style={styles.resultName}>{primary_recommendation.name}</div>
        <div style={styles.resultDesc}>{primary_recommendation.description}</div>
        <div style={styles.confidence}>
          Confidence {confidence}% · score {primary_recommendation.score}
        </div>
      </div>

      <div style={styles.sectionHeading}>Other strong matches</div>
      {alternative_recommendations.map((alt) => (
        <div key={alt.field_id} style={styles.altRow}>
          <span>{alt.name}</span>
          <span>{alt.score}</span>
        </div>
      ))}

      <div style={styles.sectionHeading}>Score breakdown</div>
      {scoreEntries.map(([fieldId, score]) => (
        <div key={fieldId}>
          <div style={styles.barLabelRow}>
            <span>{nameById[fieldId] || fieldId}</span>
            <span>{score}</span>
          </div>
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: `${(score / maxScore) * 100}%` }} />
          </div>
        </div>
      ))}

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
