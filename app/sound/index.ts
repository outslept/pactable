import { SoundEvent } from "../types"
import {
  INTRO_BASS_NOTES,
  INTRO_LEAD_NOTES,
  LEVEL_CLEAR_FANFARE,
  Z80_FRAME_SEC,
} from "./notes"

class ArcadeSoundSynthesizer {
  private ctx: AudioContext | null = null
  private wsgLeadWave: PeriodicWave | null = null
  private wsgHollowWave: PeriodicWave | null = null
  private enabled = true
  private activeNodes = new Set<AudioScheduledSourceNode>()

  constructor() {
    if (typeof window !== "undefined") {
      const unlock = () => {
        this.getContext()
      }
      window.addEventListener("keydown", unlock, { once: true, passive: true })
      window.addEventListener("pointerdown", unlock, {
        once: true,
        passive: true,
      })
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === "undefined") return null
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
        this.initWsgWaveforms(this.ctx)
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  private initWsgWaveforms(ctx: AudioContext): void {
    const hollowReal = new Float32Array([0, 0, 0, 0, 0, 0])
    const hollowImag = new Float32Array([0, 1.0, 0.0, 0.35, 0.0, 0.12])
    this.wsgHollowWave = ctx.createPeriodicWave(hollowReal, hollowImag)

    const leadReal = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0])
    const leadImag = new Float32Array([
      0, 1.0, 0.45, 0.33, 0.15, 0.2, 0.08, 0.14,
    ])
    this.wsgLeadWave = ctx.createPeriodicWave(leadReal, leadImag)
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public setEnabled(next: boolean): void {
    this.enabled = next
    if (!next) {
      this.stopAll()
    }
  }

  public stopAll(): void {
    this.activeNodes.forEach((node) => {
      try {
        node.stop()
      } catch {
      }
    })
    this.activeNodes.clear()
  }

  public playEvents(events: readonly SoundEvent[]): void {
    if (!this.enabled || events.length === 0) return
    for (const ev of events) {
      this.play(ev)
    }
  }

  private playSteppedFrames(
    frequencies: readonly number[],
    wave: "hollow" | "lead" | OscillatorType = "hollow",
    gainPeak = 0.075,
    delaySec = 0,
    frameSec = Z80_FRAME_SEC
  ): void {
    const ctx = this.getContext()
    if (!ctx || frequencies.length === 0) return

    const startTime = ctx.currentTime + delaySec
    const totalDuration = frequencies.length * frameSec

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    if (wave === "hollow" && this.wsgHollowWave) {
      osc.setPeriodicWave(this.wsgHollowWave)
    } else if (wave === "lead" && this.wsgLeadWave) {
      osc.setPeriodicWave(this.wsgLeadWave)
    } else if (wave !== "hollow" && wave !== "lead") {
      osc.type = wave
    }

    for (let i = 0; i < frequencies.length; i++) {
      osc.frequency.setValueAtTime(frequencies[i], startTime + i * frameSec)
    }

    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.004)
    gain.gain.setValueAtTime(
      gainPeak,
      Math.max(startTime + 0.005, startTime + totalDuration - 0.008)
    )
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + totalDuration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    this.activeNodes.add(osc)
    osc.onended = () => this.activeNodes.delete(osc)

    osc.start(startTime)
    osc.stop(startTime + totalDuration + 0.005)
  }

  private playNote(
    freq: number,
    startSec: number,
    durSec: number,
    wave: "lead" | "hollow",
    gainPeak: number
  ): void {
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime + startSec
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    if (wave === "lead" && this.wsgLeadWave) {
      osc.setPeriodicWave(this.wsgLeadWave)
    } else if (this.wsgHollowWave) {
      osc.setPeriodicWave(this.wsgHollowWave)
    }

    osc.frequency.setValueAtTime(freq, now)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.006)
    gain.gain.setValueAtTime(gainPeak * 0.85, now + durSec * 0.75)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec)

    osc.connect(gain)
    gain.connect(ctx.destination)

    this.activeNodes.add(osc)
    osc.onended = () => this.activeNodes.delete(osc)

    osc.start(now)
    osc.stop(now + durSec + 0.005)
  }

  private play(event: SoundEvent): void {
    switch (event.type) {
      case "WAKA": {
        const frames =
          event.phase === 0
            ? [520, 445, 370, 300, 245]
            : [245, 300, 370, 445, 520]
        this.playSteppedFrames(frames, "hollow", 0.085, 0, 0.015)
        break
      }

      case "SIREN": {
        if (event.frightened) {
          this.playSteppedFrames(
            [148, 196, 252, 318, 390, 165, 225, 310],
            "hollow",
            0.04,
            0,
            0.016
          )
        } else {
          const upward = [152, 164, 178, 194, 212, 232, 248, 232]
          const downward = [232, 212, 194, 178, 164, 152, 142, 152]
          this.playSteppedFrames(
            event.tick % 4 === 0 ? upward : downward,
            "hollow",
            0.032,
            0,
            0.019
          )
        }
        break
      }

      case "EAT_ENERGIZER": {
        this.playSteppedFrames(
          [160, 210, 275, 350, 430, 200, 280, 380, 490],
          "hollow",
          0.075,
          0,
          0.016
        )
        break
      }

      case "EAT_GHOST": {
        const frames: number[] = []
        for (let i = 0; i < 30; i++) {
          frames.push(135 + i * 31 + (i % 2 === 0 ? 22 : -14))
        }
        this.playSteppedFrames(frames, "lead", 0.085, 0, Z80_FRAME_SEC)
        break
      }

      case "EAT_FRUIT": {
        const fruitFrames = [
          580, 510, 440, 370, 310, 265, 240, 265, 310, 365, 430, 500, 575, 655,
          740, 825, 890, 930, 890, 825,
        ]
        this.playSteppedFrames(fruitFrames, "lead", 0.08, 0, 0.015)
        break
      }

      case "PACMAN_DEATH": {
        this.stopAll()
        const deathFrames: number[] = []
        const curve = [
          1.0, 0.92, 0.83, 0.75, 0.68, 0.74, 0.82, 0.89, 0.78, 0.65,
        ]
        for (let swirl = 0; swirl < 5; swirl++) {
          const top = 790 - swirl * 108
          for (const mult of curve) {
            deathFrames.push(Math.max(110, Math.round(top * mult)))
          }
        }
        this.playSteppedFrames(deathFrames, "hollow", 0.085, 0.02, 0.021)

        const popFrames = [
          185, 250, 340, 450, 580, 720, 175, 240, 330, 440, 570, 740,
        ]
        this.playSteppedFrames(popFrames, "lead", 0.08, 1.1, 0.018)
        break
      }

      case "LEVEL_CLEAR": {
        this.stopAll()
        for (const n of LEVEL_CLEAR_FANFARE) {
          this.playNote(
            n.freq,
            n.startSixteenth * 0.11,
            n.durationSixteenths * 0.1,
            "lead",
            0.075
          )
        }
        break
      }

      case "START_MELODY": {
        this.stopAll()
        const sixteenthSec = 0.13
        for (const n of INTRO_LEAD_NOTES.filter((x) => x.startSixteenth < 16)) {
          this.playNote(
            n.freq,
            n.startSixteenth * sixteenthSec,
            n.durationSixteenths * sixteenthSec * 0.86,
            "lead",
            0.065
          )
        }
        for (const b of INTRO_BASS_NOTES.filter((x) => x.startSixteenth < 16)) {
          this.playNote(
            b.freq,
            b.startSixteenth * sixteenthSec,
            b.durationSixteenths * sixteenthSec * 0.82,
            "hollow",
            0.055
          )
        }
        break
      }
    }
  }
}

export const arcadeSound = new ArcadeSoundSynthesizer()
