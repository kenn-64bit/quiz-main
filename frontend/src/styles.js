// All colors and layout live here — the single customization hook referenced
// in the README. Change `container.background` to re-theme the whole app.

const theme = {
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  card: '#ffffff',
  text: '#2d2d3a',
  muted: '#6b7280',
  accent: '#667eea',
  accentDark: '#5a4bb5',
  track: '#eef0f7',
}

export const styles = {
  theme,

  container: {
    minHeight: '100%',
    background: theme.gradient,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '24px 16px',
  },

  phone: {
    width: '100%',
    maxWidth: 420,
    minHeight: 640,
    background: theme.card,
    borderRadius: 28,
    boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    color: theme.text,
  },

  kicker: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'lowercase',
    color: theme.muted,
  },

  title: {
    textAlign: 'center',
    fontSize: 32,
    lineHeight: 1.15,
    fontWeight: 800,
    margin: '24px 0',
  },

  label: {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 8,
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 16,
    border: `2px solid ${theme.track}`,
    borderRadius: 12,
    outline: 'none',
  },

  primaryButton: {
    width: '100%',
    padding: '16px 20px',
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    background: theme.accent,
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
  },

  disabledButton: {
    background: '#c7c9d6',
    cursor: 'not-allowed',
  },

  secondaryButton: {
    padding: '12px 18px',
    fontSize: 15,
    fontWeight: 600,
    color: theme.accent,
    background: 'transparent',
    border: `2px solid ${theme.track}`,
    borderRadius: 12,
    cursor: 'pointer',
  },

  footerBadge: {
    alignSelf: 'center',
    marginTop: 'auto',
    padding: '8px 16px',
    background: theme.track,
    borderRadius: 20,
    fontSize: 13,
    color: theme.muted,
  },

  progressTrack: {
    height: 8,
    background: theme.track,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    background: theme.accent,
    transition: 'width 0.25s ease',
  },

  questionNumber: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.muted,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.35,
    margin: '8px 0 28px',
  },

  scaleRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 8,
    border: `1px solid ${theme.track}`,
    borderRadius: 14,
    overflow: 'hidden',
  },
  scaleCell: {
    padding: '16px 4px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#fafbff',
    borderRight: `1px solid ${theme.track}`,
  },
  scaleCellSelected: {
    background: theme.accent,
    color: '#fff',
  },
  scaleCellLabel: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  scaleDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: `2px solid ${theme.muted}`,
    margin: '0 auto',
  },
  scaleDotSelected: {
    borderColor: '#fff',
    background: '#fff',
  },
  scaleHint: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: theme.muted,
    marginTop: 6,
  },

  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 24,
  },

  resultCard: {
    background: theme.gradient,
    color: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  resultName: { fontSize: 22, fontWeight: 800, margin: '4px 0' },
  resultDesc: { fontSize: 14, opacity: 0.92 },
  confidence: { fontSize: 13, fontWeight: 700, marginTop: 12 },

  sectionHeading: {
    fontSize: 13,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: theme.muted,
    margin: '20px 0 10px',
  },

  altRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: `1px solid ${theme.track}`,
    fontSize: 14,
  },

  barLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    marginBottom: 4,
  },
  barTrack: {
    height: 10,
    background: theme.track,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 12,
  },
  barFill: {
    height: '100%',
    background: theme.accent,
  },

  roadmapItem: {
    fontSize: 14,
    lineHeight: 1.5,
    padding: '6px 0',
    paddingLeft: 20,
    position: 'relative',
  },

  error: {
    background: '#fdecec',
    color: '#b3261e',
    padding: '12px 14px',
    borderRadius: 12,
    fontSize: 14,
    margin: '12px 0',
    textAlign: 'center',
  },
}
