import { styles } from '../styles.js'

const OPTIONS = [
  { value: 'N/O', label: 'N/O' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
]

export default function QuizScreen({
  questions,
  index,
  responses,
  setResponse,
  onBack,
  onNext,
  submitting,
  error,
}) {
  const question = questions[index]
  const current = responses[index]
  const answered = current !== undefined && current !== null
  const isLast = index === questions.length - 1
  const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100

  return (
    <div style={styles.phone}>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      <div style={styles.questionNumber}>
        Question {index + 1} of {questions.length}
      </div>
      <div style={styles.questionText}>{question.question}</div>

      <div style={styles.scaleRow}>
        {OPTIONS.map((opt) => {
          const selected = current === opt.value
          return (
            <div
              key={opt.label}
              role="radio"
              aria-checked={selected}
              tabIndex={0}
              style={{ ...styles.scaleCell, ...(selected ? styles.scaleCellSelected : {}) }}
              onClick={() => setResponse(index, opt.value)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setResponse(index, opt.value)}
            >
              <div style={styles.scaleCellLabel}>{opt.label}</div>
              <div style={{ ...styles.scaleDot, ...(selected ? styles.scaleDotSelected : {}) }} />
            </div>
          )
        })}
      </div>
      <div style={styles.scaleHint}>
        <span>N/O = no opinion</span>
        <span>1 = disagree · 4 = agree</span>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.navRow}>
        <button style={styles.secondaryButton} onClick={onBack} disabled={submitting}>
          ← Back
        </button>
        <button
          style={{ ...styles.primaryButton, ...(answered && !submitting ? {} : styles.disabledButton), width: 'auto', flex: 1 }}
          onClick={onNext}
          disabled={!answered || submitting}
        >
          {isLast ? (submitting ? 'Analyzing…' : 'See results') : 'Next →'}
        </button>
      </div>
    </div>
  )
}
