import {
  COLS,
  DEATH_ANIM_TICKS,
  DIRS,
  FRUIT_SPAWN_COL,
  FRUIT_SPAWN_ROW,
  GHOST_FREEZE_TICKS,
  LEVEL_CLEAR_TICKS,
  LEVEL_SPECS,
  OG_MAZE_TEMPLATE,
  READY_TICKS,
  ROWS,
} from "./constants"
import {
  createInitialGhosts,
  getGlobalWaveMode,
  stepGhost,
} from "./ghost-ai"
import {
  type Direction,
  type EngineStepResult,
  type GameState,
  type GhostPopupState,
  type GhostScoreValue,
  type LevelNumber,
  type SoundEvent,
} from "./types"

/**
 * Parses the ASCII maze template into a 2D numeric grid and counts initial pellets
 * (2 = standard dot, 3 = energizer) so win conditions match the template automatically.
 */
function parseInitialBoard(): {
  readonly board: readonly (readonly number[])[]
  readonly totalDots: number
} {
  let totalDots = 0
  const board = OG_MAZE_TEMPLATE.map((row) =>
    row.split("").map((ch) => {
      const val = Number(ch)
      if (val === 2 || val === 3) totalDots++
      return val
    })
  )
  return { board, totalDots }
}

/**
 * Creates a fresh state for a given level while preserving cumulative score,
 * high score, and remaining lives across level transitions.
 */
export function createLevelState(
  level: LevelNumber,
  score = 0,
  highScore = 0,
  lives = 3
): GameState {
  const { board, totalDots } = parseInitialBoard()
  return {
    level,
    board,
    pacman: { r: 23, c: 13, dir: "LEFT", nextDir: "LEFT", frame: 2 },
    ghosts: createInitialGhosts(level),
    bonusFruit: {
      active: false,
      timer: 0,
      scorePopup: null,
      popupTimer: 0,
    },
    ghostPopup: null,
    score,
    highScore,
    lives,
    dotsLeft: totalDots,
    dotsEaten: 0,
    tick: 0,
    frightenedTimer: 0,
    ghostCombo: 0,
    globalMode: "SCATTER",
    statusTimer: READY_TICKS,
    status: "READY",
  }
}

function toGhostScore(combo: number): GhostScoreValue {
  const raw = 200 * Math.pow(2, Math.min(combo, 4) - 1)
  if (raw === 400 || raw === 800 || raw === 1600) return raw
  return 200
}

export function stepGameTick(
  prev: GameState
): EngineStepResult & { readonly didResetBoard?: boolean } {
  // 1. Pre-round "READY!" freeze before entities start moving.
  if (prev.status === "READY") {
    if (prev.statusTimer > 1) {
      return {
        state: { ...prev, statusTimer: prev.statusTimer - 1 },
        sounds: [],
      }
    }
    return {
      state: { ...prev, status: "PLAYING", statusTimer: 0 },
      sounds: [],
    }
  }

  // 2. Brief freeze when a frightened ghost is eaten to display the 200..1600 popup.
  if (prev.status === "GHOST_EATEN") {
    if (prev.statusTimer > 1) {
      return {
        state: { ...prev, statusTimer: prev.statusTimer - 1 },
        sounds: [],
      }
    }
    return {
      state: { ...prev, status: "PLAYING", statusTimer: 0 },
      sounds: [],
    }
  }

  // 3. Death sequence: steps through Pac-Man's 5-frame collapse (frames 3..7),
  // then either ends the game or respawns entities on the current board without resetting dots.
  if (prev.status === "DYING") {
    if (prev.statusTimer > 1) {
      const nextTimer = prev.statusTimer - 1
      const progress = DEATH_ANIM_TICKS - nextTimer
      const deathFrameIdx = Math.min(
        4,
        Math.floor((progress / DEATH_ANIM_TICKS) * 5)
      )
      return {
        state: {
          ...prev,
          statusTimer: nextTimer,
          pacman: { ...prev.pacman, frame: 3 + deathFrameIdx },
        },
        sounds: [],
      }
    }

    const nextLives = prev.lives - 1
    if (nextLives <= 0) {
      return {
        state: {
          ...prev,
          lives: 0,
          status: "GAME_OVER",
          statusTimer: 0,
        },
        sounds: [],
      }
    }

    return {
      state: {
        ...prev,
        pacman: { r: 23, c: 13, dir: "LEFT", nextDir: "LEFT", frame: 2 },
        ghosts: createInitialGhosts(prev.level),
        bonusFruit: {
          active: false,
          timer: 0,
          scorePopup: null,
          popupTimer: 0,
        },
        ghostPopup: null,
        lives: nextLives,
        tick: 0,
        frightenedTimer: 0,
        ghostCombo: 0,
        globalMode: "SCATTER",
        status: "READY",
        statusTimer: READY_TICKS,
      },
      sounds: [],
    }
  }

  // 4. Level clear: flashes maze walls, then advances to next level.
  if (prev.status === "LEVEL_CLEAR") {
    if (prev.statusTimer > 1) {
      return {
        state: { ...prev, statusTimer: prev.statusTimer - 1 },
        sounds: [],
      }
    }
    if (prev.level < 5) {
      const nextLvl = (prev.level + 1) as LevelNumber
      return {
        state: createLevelState(
          nextLvl,
          prev.score,
          prev.highScore,
          prev.lives
        ),
        sounds: [{ type: "START_MELODY" }],
        didResetBoard: true,
      }
    }
    return {
      state: { ...prev, status: "WON", statusTimer: 0 },
      sounds: [],
    }
  }

  // Paused, Won, or Game Over states are inert on tick.
  if (prev.status !== "PLAYING") {
    return { state: prev, sounds: [] }
  }

  const sounds: SoundEvent[] = []
  const spec = LEVEL_SPECS[prev.level]
  const nextTick = prev.tick + 1
  let board = prev.board

  let {
    score,
    highScore,
    dotsLeft,
    dotsEaten,
    frightenedTimer,
    ghostCombo,
  } = prev
  let bonusFruit = prev.bonusFruit
  let ghostPopup: GhostPopupState | null = prev.ghostPopup

  if (ghostPopup !== null) {
    ghostPopup =
      ghostPopup.timer > 1
        ? { ...ghostPopup, timer: ghostPopup.timer - 1 }
        : null
  }

  if (bonusFruit.active || bonusFruit.popupTimer > 0) {
    const nextTimer = bonusFruit.active ? bonusFruit.timer - 1 : 0
    const nextPopupTimer =
      bonusFruit.popupTimer > 0 ? bonusFruit.popupTimer - 1 : 0
    bonusFruit = {
      active: bonusFruit.active && nextTimer > 0,
      timer: nextTimer,
      scorePopup: nextPopupTimer > 0 ? bonusFruit.scorePopup : null,
      popupTimer: nextPopupTimer,
    }
  }

  const nextMode = getGlobalWaveMode(nextTick, prev.level)
  const modeSwitched = nextMode !== prev.globalMode && frightenedTimer === 0

  // 5. Pac-Man movement with buffered input (`nextDir`):
  // applies buffered turn as soon as the target corridor opens, otherwise continues straight.
  // eslint-disable-next-line prefer-const
  let { r: pacR, c: pacC, dir: pacDir, nextDir, frame } = prev.pacman

  const canPacWalk = (d: Direction): boolean => {
    const nr = pacR + DIRS[d].dr
    const nc = pacC + DIRS[d].dc
    if (nr === 14 && (nc < 0 || nc >= COLS)) return true // row 14 wrap-around tunnel
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false
    const tile = board[nr][nc]
    // 1 = wall, 4 = ghost house door, 5 = ghost house interior, 9 = out-of-bounds void
    return tile !== 1 && tile !== 4 && tile !== 5 && tile !== 9
  }

  if (canPacWalk(nextDir)) pacDir = nextDir
  if (canPacWalk(pacDir)) {
    pacR += DIRS[pacDir].dr
    pacC = (pacC + DIRS[pacDir].dc + COLS) % COLS
    frame = (frame + 1) % 3
  }

  // 6. Pellet & energizer consumption.
  let triggeredFrightened = false
  const steppedTile = board[pacR][pacC]

  if (steppedTile === 2 || steppedTile === 3) {
    const nextBoard = [...board]
    const nextRow = [...board[pacR]]
    nextRow[pacC] = 0
    nextBoard[pacR] = nextRow
    board = nextBoard
    dotsLeft--
    dotsEaten++

    if (steppedTile === 2) {
      score += 10
      sounds.push({ type: "WAKA", phase: (dotsEaten & 1) as 0 | 1 })
    } else {
      score += 50
      frightenedTimer = spec.frightenedTicks
      ghostCombo = 0
      triggeredFrightened = true
      sounds.push({ type: "EAT_ENERGIZER" })
    }
  } else {
    if (frightenedTimer > 0) frightenedTimer--
    if (nextTick % 2 === 0) {
      sounds.push({
        type: "SIREN",
        frightened: frightenedTimer > 0,
        tick: nextTick,
      })
    }
  }

  if (
    (dotsEaten === 70 || dotsEaten === 170) &&
    dotsEaten !== prev.dotsEaten
  ) {
    bonusFruit = {
      active: true,
      timer: 58,
      scorePopup: null,
      popupTimer: 0,
    }
  }

  if (
    bonusFruit.active &&
    pacR === FRUIT_SPAWN_ROW &&
    pacC === FRUIT_SPAWN_COL
  ) {
    score += spec.fruitPoints
    bonusFruit = {
      active: false,
      timer: 0,
      scorePopup: spec.fruitPoints,
      popupTimer: 14,
    }
    sounds.push({ type: "EAT_FRUIT" })
  }

  if (score > highScore) highScore = score

  if (dotsLeft <= 0) {
    return {
      state: {
        ...prev,
        board,
        pacman: { r: pacR, c: pacC, dir: pacDir, nextDir, frame },
        bonusFruit,
        ghostPopup: null,
        score,
        highScore,
        dotsLeft: 0,
        dotsEaten,
        statusTimer: LEVEL_CLEAR_TICKS,
        status: "LEVEL_CLEAR",
      },
      sounds: [{ type: "LEVEL_CLEAR" }],
    }
  }

  // Phase A checks collisions after Pac-Man moves into a ghost's tile;
  // Phase B steps ghosts and checks if a ghost moved into Pac-Man's tile.
  // Without both checks, Pac-Man and a ghost moving head-on would swap tiles and pass through each other.
  let pacCaught = false
  let ateGhostThisTick = false
  const prevBlinky =
    prev.ghosts.find((g) => g.id === "blinky") ?? prev.ghosts[0]

  let ghosts = prev.ghosts.map((g) => {
    let state = g.state
    let dir = g.dir

    // Ghosts immediately reverse direction when entering FRIGHTENED or switching wave modes.
    if (triggeredFrightened && state !== "EATEN") {
      state = "FRIGHTENED"
      dir = DIRS[dir].opposite
    } else if (frightenedTimer === 0 && state === "FRIGHTENED") {
      state = "NORMAL"
    } else if (modeSwitched && state === "NORMAL") {
      dir = DIRS[dir].opposite
    }

    if (g.r === pacR && g.c === pacC) {
      if (state === "FRIGHTENED") {
        state = "EATEN"
        ghostCombo++
        const pts = toGhostScore(ghostCombo)
        score += pts
        if (score > highScore) highScore = score
        ghostPopup = { r: pacR, c: pacC, points: pts, timer: 10 }
        ateGhostThisTick = true
      } else if (state === "NORMAL") {
        pacCaught = true
      }
    }

    return { ...g, state, dir }
  })

  const nextPacman = { r: pacR, c: pacC, dir: pacDir, nextDir, frame }

  if (!pacCaught && !ateGhostThisTick) {
    ghosts = ghosts.map((g) => {
      // Inky's target vector depends on Blinky's current position.
      const currentBlinky =
        ghosts.find((x) => x.id === "blinky") ?? prevBlinky
      const moved = stepGhost(
        g,
        board,
        nextPacman,
        currentBlinky,
        nextMode,
        dotsLeft,
        nextTick,
        prev.level
      )

      let finalState = moved.state
      if (moved.r === pacR && moved.c === pacC) {
        if (finalState === "FRIGHTENED") {
          finalState = "EATEN"
          ghostCombo++
          const pts = toGhostScore(ghostCombo)
          score += pts
          if (score > highScore) highScore = score
          ghostPopup = { r: pacR, c: pacC, points: pts, timer: 10 }
          ateGhostThisTick = true
        } else if (finalState === "NORMAL") {
          pacCaught = true
        }
      }

      return { ...moved, state: finalState }
    })
  }

  if (ateGhostThisTick) {
    sounds.push({ type: "EAT_GHOST" })
  }

  if (pacCaught) {
    return {
      state: {
        ...prev,
        board,
        pacman: { ...nextPacman, frame: 3 },
        ghosts,
        bonusFruit,
        ghostPopup: null,
        score,
        highScore,
        dotsLeft,
        dotsEaten,
        tick: nextTick,
        status: "DYING",
        statusTimer: DEATH_ANIM_TICKS,
      },
      sounds: [{ type: "PACMAN_DEATH" }],
    }
  }

  return {
    state: {
      ...prev,
      board,
      pacman: nextPacman,
      ghosts,
      bonusFruit,
      ghostPopup,
      score,
      highScore,
      dotsLeft,
      dotsEaten,
      tick: nextTick,
      frightenedTimer,
      ghostCombo,
      globalMode: nextMode,
      status: ateGhostThisTick ? "GHOST_EATEN" : "PLAYING",
      statusTimer: ateGhostThisTick ? GHOST_FREEZE_TICKS : 0,
    },
    sounds,
  }
}
