export const Z80_FRAME_SEC = 1 / 60

export interface NoteStep {
  readonly freq: number
  readonly startSixteenth: number
  readonly durationSixteenths: number
}

export const INTRO_LEAD_NOTES: readonly NoteStep[] = [
  { freq: 493.88, startSixteenth: 0, durationSixteenths: 1 },
  { freq: 987.77, startSixteenth: 1, durationSixteenths: 1 },
  { freq: 739.99, startSixteenth: 2, durationSixteenths: 1 },
  { freq: 622.25, startSixteenth: 3, durationSixteenths: 1 },
  { freq: 987.77, startSixteenth: 4, durationSixteenths: 0.5 },
  { freq: 739.99, startSixteenth: 4.5, durationSixteenths: 1.5 },
  { freq: 622.25, startSixteenth: 6, durationSixteenths: 2 },

  { freq: 523.25, startSixteenth: 8, durationSixteenths: 1 },
  { freq: 1046.5, startSixteenth: 9, durationSixteenths: 1 },
  { freq: 783.99, startSixteenth: 10, durationSixteenths: 1 },
  { freq: 659.25, startSixteenth: 11, durationSixteenths: 1 },
  { freq: 1046.5, startSixteenth: 12, durationSixteenths: 0.5 },
  { freq: 783.99, startSixteenth: 12.5, durationSixteenths: 1.5 },
  { freq: 659.25, startSixteenth: 14, durationSixteenths: 2 },

  { freq: 493.88, startSixteenth: 16, durationSixteenths: 1 },
  { freq: 987.77, startSixteenth: 17, durationSixteenths: 1 },
  { freq: 739.99, startSixteenth: 18, durationSixteenths: 1 },
  { freq: 622.25, startSixteenth: 19, durationSixteenths: 1 },
  { freq: 987.77, startSixteenth: 20, durationSixteenths: 0.5 },
  { freq: 739.99, startSixteenth: 20.5, durationSixteenths: 1.5 },
  { freq: 622.25, startSixteenth: 22, durationSixteenths: 2 },

  { freq: 622.25, startSixteenth: 24, durationSixteenths: 0.5 },
  { freq: 659.25, startSixteenth: 24.5, durationSixteenths: 0.5 },
  { freq: 698.46, startSixteenth: 25, durationSixteenths: 1 },
  { freq: 698.46, startSixteenth: 26, durationSixteenths: 0.5 },
  { freq: 739.99, startSixteenth: 26.5, durationSixteenths: 0.5 },
  { freq: 783.99, startSixteenth: 27, durationSixteenths: 1 },
  { freq: 783.99, startSixteenth: 28, durationSixteenths: 0.5 },
  { freq: 830.61, startSixteenth: 28.5, durationSixteenths: 0.5 },
  { freq: 880.0, startSixteenth: 29, durationSixteenths: 1 },
  { freq: 987.77, startSixteenth: 30, durationSixteenths: 2 },
]

export const INTRO_BASS_NOTES: readonly NoteStep[] = [
  { freq: 123.47, startSixteenth: 0, durationSixteenths: 3 },
  { freq: 246.94, startSixteenth: 3, durationSixteenths: 1 },
  { freq: 123.47, startSixteenth: 4, durationSixteenths: 3 },
  { freq: 246.94, startSixteenth: 7, durationSixteenths: 1 },

  { freq: 130.81, startSixteenth: 8, durationSixteenths: 3 },
  { freq: 261.63, startSixteenth: 11, durationSixteenths: 1 },
  { freq: 130.81, startSixteenth: 12, durationSixteenths: 3 },
  { freq: 261.63, startSixteenth: 15, durationSixteenths: 1 },

  { freq: 123.47, startSixteenth: 16, durationSixteenths: 3 },
  { freq: 246.94, startSixteenth: 19, durationSixteenths: 1 },
  { freq: 123.47, startSixteenth: 20, durationSixteenths: 3 },
  { freq: 246.94, startSixteenth: 23, durationSixteenths: 1 },

  { freq: 185.0, startSixteenth: 24, durationSixteenths: 2 },
  { freq: 207.65, startSixteenth: 26, durationSixteenths: 2 },
  { freq: 233.08, startSixteenth: 28, durationSixteenths: 2 },
  { freq: 246.94, startSixteenth: 30, durationSixteenths: 2 },
]

export const LEVEL_CLEAR_FANFARE: readonly NoteStep[] = [
  { freq: 523.25, startSixteenth: 0, durationSixteenths: 1 },
  { freq: 659.25, startSixteenth: 1, durationSixteenths: 1 },
  { freq: 783.99, startSixteenth: 2, durationSixteenths: 1 },
  { freq: 1046.5, startSixteenth: 3, durationSixteenths: 2.5 },
]
