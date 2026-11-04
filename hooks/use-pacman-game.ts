"use client"

import * as React from "react"
import { packCellState } from "../lib/cell-packing"
import { LEVEL_SPECS } from "../lib/constants"
import { createLevelState, stepGameTick } from "../lib/engine"
import { arcadeSound } from "../lib/sound"
import {
  type Direction,
  type GameState,
  type LevelNumber,
  type SoundEvent,
} from "../lib/types"

export class PacmanStore {
  private state: GameState
  private listeners = new Set<() => void>()
  public wallVersion = 0
  public cellRendersCurrentTick = 0

  constructor() {
    this.state = createLevelState(1, 0, 0, 3)
  }

  getState = (): GameState => this.state

  setState(updater: (prev: GameState) => GameState) {
    const next = updater(this.state)
    if (next !== this.state) {
      this.cellRendersCurrentTick = 0
      this.state = next
      this.listeners.forEach((l) => l())
    }
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  recordCellRender() {
    this.cellRendersCurrentTick++
  }
}

export function useCellPackedState(
  store: PacmanStore,
  r: number,
  c: number
): number {
  const getSnapshot = React.useCallback(
    () => packCellState(store.getState(), r, c, store.wallVersion),
    [store, r, c]
  )
  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)
}

export function usePacmanGame() {
  const [store] = React.useState(() => new PacmanStore())
  const [soundEnabled, setSoundEnabled] = React.useState(true)

  const game = React.useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState
  )

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "KeyP") {
        e.preventDefault()
        store.setState((prev) => ({
          ...prev,
          status:
            prev.status === "PLAYING"
              ? "PAUSED"
              : prev.status === "PAUSED"
              ? "PLAYING"
              : prev.status,
        }))
        return
      }

      const keyMap: Readonly<Record<string, Direction>> = {
        ArrowUp: "UP",
        KeyW: "UP",
        ArrowLeft: "LEFT",
        KeyA: "LEFT",
        ArrowDown: "DOWN",
        KeyS: "DOWN",
        ArrowRight: "RIGHT",
        KeyD: "RIGHT",
      }
      const nextDir = keyMap[e.code]
      if (nextDir) {
        e.preventDefault()
        store.setState((prev) => ({
          ...prev,
          pacman: { ...prev.pacman, nextDir },
        }))
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [store])

  const currentTickMs = LEVEL_SPECS[game.level].tickMs

  React.useEffect(() => {
    const timer = setInterval(() => {
      let emittedSounds: readonly SoundEvent[] = []
      store.setState((prev) => {
        const result = stepGameTick(prev)
        if (result.didResetBoard) {
          store.wallVersion++
        }
        emittedSounds = result.sounds
        return result.state
      })
      if (emittedSounds.length > 0) {
        arcadeSound.playEvents(emittedSounds)
      }
    }, currentTickMs)

    return () => clearInterval(timer)
  }, [store, currentTickMs])

  const togglePause = React.useCallback(() => {
    store.setState((prev) => ({
      ...prev,
      status:
        prev.status === "PLAYING" || prev.status === "READY"
          ? "PAUSED"
          : prev.status === "PAUSED"
          ? "PLAYING"
          : prev.status,
    }))
  }, [store])

  const restartGame = React.useCallback(() => {
    // TODO: revisit to remove this
    // eslint-disable-next-line react-hooks/immutability
    store.wallVersion++
    store.setState((prev) => createLevelState(1, 0, prev.highScore, 3))
    arcadeSound.playEvents([{ type: "START_MELODY" }])
  }, [store])

  const selectLevel = React.useCallback(
    (level: LevelNumber) => {
      // TODO: revisit to remove this
      // eslint-disable-next-line react-hooks/immutability
      store.wallVersion++
      store.setState((prev) =>
        createLevelState(level, prev.score, prev.highScore, 3)
      )
      arcadeSound.playEvents([{ type: "START_MELODY" }])
    },
    [store]
  )

  const toggleSound = React.useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev
      arcadeSound.setEnabled(next)
      return next
    })
  }, [])

  return {
    store,
    game,
    soundEnabled,
    toggleSound,
    togglePause,
    restartGame,
    selectLevel,
  }
}
