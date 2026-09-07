import { useEffect, useState } from 'react'
import { styles } from './styles.js'
import { fetchQuestions, analyze } from './api.js'
import StartScreen from './components/StartScreen.jsx'
import QuizScreen from './components/QuizScreen.jsx'
import ResultsScreen from './components/ResultsScreen.jsx'

const CONNECTION_ERROR =
  'Connection Error — make sure the backend is running on port 5000.'

export default function App() {
  const [screen, setScreen] = useState('start') // start | quiz | results
  const [name, setName] = useState('')
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState([])
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showBackModal, setShowBackModal] = useState(false)

  useEffect(() => {
    fetchQuestions()
      .then((qs) => {
        setQuestions(qs)
        setResponses(new Array(qs.length).fill(null))
      })
      .catch(() => setError(CONNECTION_ERROR))
      .finally(() => setLoading(false))
  }, [])

  function setResponse(i, value) {
    setResponses((prev) => {
      const next = [...prev]
      next[i] = value
      return next
    })
  }

  function startQuiz() {
    if (!questions.length) {
      setError(CONNECTION_ERROR)
      return
    }
    setError('')
    setIndex(0)
    setScreen('quiz')
  }

  async function goNext() {
    setError('')
    if (index < questions.length - 1) {
      setIndex(index + 1)
      return
    }
    setSubmitting(true)
    try {
      const data = await analyze(name.trim(), responses)
      setResult(data)
      setScreen('results')
    } catch {
      setError(CONNECTION_ERROR)
    } finally {
      setSubmitting(false)
    }
  }

  function requestBack() {
    setShowBackModal(true)
  }

  function goBack() {
    setShowBackModal(false)
    setError('')
    if (index === 0) {
      setScreen('start')
      return
    }
    setIndex(index - 1)
  }

  function restart() {
    setResponses(new Array(questions.length).fill(null))
    setIndex(0)
    setResult(null)
    setError('')
    setShowBackModal(false)
    setScreen('start')
  }

  return (
    <div style={styles.container}>
      <div style={styles.frame}>
        <div style={styles.titlebar}>🎧 Tech Stack Quiz</div>
        {screen === 'quiz' && (
          <div style={styles.subCaption}>
            ☀ ▾ (rate each statement — 1 disagree · 3 neutral · 5 agree)
          </div>
        )}

        {screen === 'start' && (
          <StartScreen
            name={name}
            setName={setName}
            onStart={startQuiz}
            loading={loading}
            error={error}
          />
        )}
        {screen === 'quiz' && (
          <QuizScreen
            questions={questions}
            index={index}
            responses={responses}
            setResponse={setResponse}
            onBack={requestBack}
            onNext={goNext}
            submitting={submitting}
            error={error}
          />
        )}
        {screen === 'results' && result && (
          <ResultsScreen result={result} onRestart={restart} />
        )}

        <div style={styles.footerStrip}>› by yourstruly</div>
      </div>

      {screen === 'quiz' && showBackModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div>Are you really sure? changes are not saved</div>
            <div style={styles.modalActions}>
              <button style={styles.secondaryButton} onClick={() => setShowBackModal(false)}>
                Stay
              </button>
              <button style={{ ...styles.primaryButton, width: 'auto', flex: 1 }} onClick={goBack}>
                Yes, go back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
