// All colors and layout live here — the single customization hook.
// Aesthetic: early-2000s Windows-XP / Frutiger-Aero "carrd" template —
// glossy lime titlebar, beveled inset panels, monospace type. Change the
// `theme` tokens below to re-skin the whole app.

const theme = {
  pageBg: '#b7d38c',
  frame: '#ffffff',
  titlebarFrom: '#e9f4d4',
  titlebarTo: '#a9cd6e',
  panel: '#ffffff',
  panelBorder: '#cfe0a8',
  ink: '#4c4a3c', // headings / nav / button text
  body: '#6f7d4f', // monospace body text
  green: '#7ba428', // accent / links / bold
  greenDark: '#5f8420',
  chipBg: '#dcebc9',
  track: '#e9f1da',
  bevelLight: '#ffffff',
  bevelDark: '#9db873',
  mono: "'Courier New', ui-monospace, SFMono-Regular, Menlo, monospace",
}

export const styles = {
  theme,

  container: {
    minHeight: '100%',
    background: `repeating-linear-gradient(115deg, rgba(255,255,255,0.18) 0 22px, rgba(255,255,255,0) 22px 60px), ${theme.pageBg}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '24px 16px',
    fontFamily: theme.mono,
    color: theme.body,
    overflowX: 'hidden',
  },

  frame: {
    width: '100%',
    maxWidth: 440,
    minWidth: 0,
    background: theme.frame,
    borderRadius: 18,
    border: '1px solid #ffffff',
    boxShadow: '0 24px 60px rgba(60,80,30,0.35)',
    overflow: 'hidden',
    padding: 6,
  },

  titlebar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: `linear-gradient(${theme.titlebarFrom}, ${theme.titlebarTo})`,
    borderRadius: 12,
    padding: '9px 14px',
    fontFamily: theme.mono,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: theme.ink,
  },

  subCaption: {
    padding: '8px 14px 2px',
    fontSize: 12,
    color: theme.body,
  },

  // The inner white content panel (each screen renders this wrapper).
  phone: {
    background: theme.panel,
    border: `1px solid ${theme.panelBorder}`,
    borderRadius: 14,
    padding: '20px 18px',
    margin: 10,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: theme.mono,
    color: theme.body,
    minWidth: 0,
    overflowWrap: 'anywhere',
  },

  kicker: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.green,
  },

  title: {
    fontSize: 26,
    lineHeight: 1.2,
    fontWeight: 800,
    color: theme.ink,
    margin: '16px 0 20px',
  },

  label: {
    fontWeight: 700,
    fontSize: 13,
    color: theme.ink,
    marginBottom: 8,
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: 15,
    fontFamily: theme.mono,
    color: theme.ink,
    background: '#ffffff',
    border: `2px solid ${theme.bevelDark}`,
    borderTopColor: '#8fac66',
    borderLeftColor: '#8fac66',
    borderRadius: 6,
    outline: 'none',
  },

  primaryButton: {
    width: '100%',
    padding: '13px 18px',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: theme.mono,
    color: theme.ink,
    background: 'linear-gradient(#f4f9e8, #cfe3a5)',
    border: '1px solid #8aa958',
    borderRadius: 6,
    boxShadow: 'inset 0 1px 0 #ffffff',
    cursor: 'pointer',
  },

  disabledButton: {
    background: '#e3e6d7',
    color: '#9aa088',
    borderColor: '#c3c9b2',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },

  secondaryButton: {
    padding: '11px 16px',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: theme.mono,
    color: theme.ink,
    background: 'linear-gradient(#fbfdf5, #e2ead0)',
    border: '1px solid #9db873',
    borderRadius: 6,
    boxShadow: 'inset 0 1px 0 #ffffff',
    cursor: 'pointer',
  },

  footerBadge: {
    alignSelf: 'flex-start',
    marginTop: 16,
    padding: '2px 10px',
    background: theme.chipBg,
    color: theme.greenDark,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },

  progressTrack: {
    height: 10,
    background: theme.track,
    border: `1px solid ${theme.panelBorder}`,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    background: `linear-gradient(${theme.green}, ${theme.greenDark})`,
    transition: 'width 0.25s ease',
  },

  questionNumber: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.green,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.4,
    color: theme.ink,
    margin: '8px 0 24px',
    textAlign: 'center',
  },

  scaleRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    border: `1px solid ${theme.panelBorder}`,
    borderRadius: 8,
    overflow: 'hidden',
    background: '#ffffff',
  },
  scaleCell: {
    padding: '16px 4px',
    textAlign: 'center',
    cursor: 'pointer',
    background: theme.track,
    borderRight: `1px solid ${theme.panelBorder}`,
  },
  scaleCellSelected: {
    background: theme.green,
    color: '#ffffff',
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
    border: `2px solid ${theme.green}`,
    margin: '0 auto',
  },
  scaleDotSelected: {
    borderColor: '#ffffff',
    background: '#ffffff',
  },
  scaleHint: {
    display: 'flex',
    justifyContent: 'center',
    fontSize: 11,
    color: theme.body,
    marginTop: 8,
  },

  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
    paddingTop: 20,
  },

  resultCard: {
    background: '#f3f8e8',
    color: theme.ink,
    border: `1px solid ${theme.panelBorder}`,
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
  },
  resultName: { fontSize: 20, fontWeight: 800, margin: '4px 0', color: theme.green },
  resultStatement: { fontSize: 22, fontWeight: 800, lineHeight: 1.3, margin: '4px 0 8px', color: theme.green },
  resultDesc: { fontSize: 14, color: theme.body, lineHeight: 1.5 },
  confidence: { fontSize: 13, fontWeight: 700, marginTop: 12 },

  chip: {
    display: 'inline-block',
    padding: '2px 8px',
    background: theme.chipBg,
    color: theme.greenDark,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
  },

  sectionHeading: {
    display: 'inline-block',
    fontSize: 15,
    fontWeight: 800,
    color: theme.green,
    borderBottom: `2px solid ${theme.green}`,
    paddingBottom: 2,
    margin: '20px 0 10px',
  },

  altRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: `1px solid ${theme.panelBorder}`,
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
    background: theme.green,
  },

  roadmapItem: {
    fontSize: 14,
    lineHeight: 1.5,
    padding: '6px 0',
    paddingLeft: 20,
    position: 'relative',
    color: theme.body,
    overflowWrap: 'anywhere',
  },

  footerStrip: {
    background: theme.track,
    borderTop: `1px solid ${theme.bevelDark}`,
    borderBottom: `1px solid ${theme.bevelLight}`,
    textAlign: 'center',
    padding: '8px',
    fontSize: 12,
    color: theme.body,
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(40,50,20,0.45)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 50,
    overflowY: 'auto',
  },
  modalCard: {
    background: theme.panel,
    color: theme.ink,
    border: `1px solid ${theme.panelBorder}`,
    borderRadius: 10,
    boxShadow: '0 20px 50px rgba(60,80,30,0.4)',
    padding: 24,
    maxWidth: 320,
    width: '100%',
    maxHeight: 'calc(100vh - 32px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    textAlign: 'center',
    fontFamily: theme.mono,
    fontSize: 14,
    fontWeight: 700,
  },
  modalScroll: {
    overflowY: 'auto',
    minHeight: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  modalActions: {
    display: 'flex',
    gap: 12,
    marginTop: 20,
    flexShrink: 0,
  },

  error: {
    background: '#fdecec',
    color: '#b3261e',
    border: '1px solid #e8b4b0',
    padding: '10px 12px',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: theme.mono,
    margin: '12px 0',
    textAlign: 'center',
  },
}
