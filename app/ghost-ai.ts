import { COLS, DIR_PRIORITY, DIRS, LEVEL_SPECS, ROWS } from "./constants"
import {
  type Direction,
  type Ghost,
  type GhostMode,
  type LevelNumber,
  type PacmanEntity,
} from "./types"

/**
 * Spawns the 4 ghosts at their arcade starting tiles with staggered release timers.
 * Blinky starts outside above the pen door (11, 13); Pinky, Inky, and Clyde start inside.
 * Initial `targetR`/`targetC` point to each ghost's fixed SCATTER corner outside the playable grid.
 */
export function createInitialGhosts(level: LevelNumber): readonly Ghost[] {
  const spec = LEVEL_SPECS[level]
  return [
    {
      id: "blinky",
      name: "Blinky",
      color: "#ff0000",
      r: 11,
      c: 13,
      dir: "LEFT",
      targetR: -3,
      targetC: 25,
      state: "NORMAL",
      releaseTick: spec.releaseTicks.blinky,
    },
    {
      id: "pinky",
      name: "Pinky",
      color: "#ffb8ff",
      r: 14,
      c: 13,
      dir: "DOWN",
      targetR: -3,
      targetC: 2,
      state: "NORMAL",
      releaseTick: spec.releaseTicks.pinky,
    },
    {
      id: "inky",
      name: "Inky",
      color: "#00ffff",
      r: 14,
      c: 11,
      dir: "UP",
      targetR: 31,
      targetC: 27,
      state: "NORMAL",
      releaseTick: spec.releaseTicks.inky,
    },
    {
      id: "clyde",
      name: "Clyde",
      color: "#ffb852",
      r: 14,
      c: 15,
      dir: "UP",
      targetR: 31,
      targetC: 0,
      state: "NORMAL",
      releaseTick: spec.releaseTicks.clyde,
    },
  ]
}

export function getGlobalWaveMode(
  tick: number,
  level: LevelNumber
): GhostMode {
  const waves = LEVEL_SPECS[level].scatterWaves
  const isScatter = waves.some((w) => tick >= w.start && tick < w.end)
  return isScatter ? "SCATTER" : "CHASE"
}

export function isInsideGhostHouse(r: number, c: number): boolean {
  return r >= 12 && r <= 15 && c >= 11 && c <= 16
}

export function computeGhostTarget(
  ghost: Ghost,
  pacman: PacmanEntity,
  blinky: Ghost,
  globalMode: GhostMode,
  dotsLeft: number,
  level: LevelNumber
): { readonly r: number; readonly c: number } {
  if (ghost.state === "EATEN") {
    return { r: 14, c: 13 }
  }

  if (isInsideGhostHouse(ghost.r, ghost.c)) {
    return { r: 11, c: 13 }
  }

  const elroyThreshold = LEVEL_SPECS[level].elroy1Dots
  const isBlinkyAngry = ghost.id === "blinky" && dotsLeft <= elroyThreshold

  if (globalMode === "SCATTER" && !isBlinkyAngry) {
    switch (ghost.id) {
      case "blinky":
        return { r: -3, c: 25 }
      case "pinky":
        return { r: -3, c: 2 }
      case "inky":
        return { r: 31, c: 27 }
      case "clyde":
        return { r: 31, c: 0 }
    }
  }

  switch (ghost.id) {
    // Blinky (Shadow): targets Pac-Man's exact tile.
    case "blinky":
      return { r: pacman.r, c: pacman.c }

    // Pinky (Speedy): ambushes 4 tiles ahead of Pac-Man.
    // Reproduces the ROM hex-addition overflow bug: facing UP also offsets 4 tiles LEFT.
    case "pinky": {
      if (pacman.dir === "UP") {
        return { r: pacman.r - 4, c: pacman.c - 4 }
      }
      return {
        r: pacman.r + DIRS[pacman.dir].dr * 4,
        c: pacman.c + DIRS[pacman.dir].dc * 4,
      }
    }

    // Inky (Bashful): takes a pivot 2 tiles ahead of Pac-Man (with the same UP+LEFT bug)
    // and doubles the vector from Blinky's position through that pivot.
    case "inky": {
      const pivotR =
        pacman.dir === "UP"
          ? pacman.r - 2
          : pacman.r + DIRS[pacman.dir].dr * 2
      const pivotC =
        pacman.dir === "UP"
          ? pacman.c - 2
          : pacman.c + DIRS[pacman.dir].dc * 2
      return {
        r: pivotR + (pivotR - blinky.r),
        c: pivotC + (pivotC - blinky.c),
      }
    }

    // Clyde (Pokey): chases Pac-Man when >= 8 tiles away (distSq >= 64),
    // but retreats to his bottom-left scatter corner whenever he gets closer.
    case "clyde": {
      const distSq =
        (ghost.r - pacman.r) * (ghost.r - pacman.r) +
        (ghost.c - pacman.c) * (ghost.c - pacman.c)
      return distSq >= 64 ? { r: pacman.r, c: pacman.c } : { r: 31, c: 0 }
    }
  }
}

export function stepGhost(
  ghost: Ghost,
  board: readonly (readonly number[])[],
  pacman: PacmanEntity,
  blinky: Ghost,
  globalMode: GhostMode,
  dotsLeft: number,
  tick: number,
  level: LevelNumber
): Ghost {
  if (tick < ghost.releaseTick) return ghost

  // Eyes reaching the center of the ghost house immediately revive and exit upward.
  if (ghost.state === "EATEN" && ghost.r === 14 && ghost.c === 13) {
    return { ...ghost, state: "NORMAL", dir: "UP" }
  }

  // Frightened ghosts move at 2/3 speed by skipping every 3rd tick.
  if (ghost.state === "FRIGHTENED" && tick % 3 === 0) {
    return ghost
  }

  const target = computeGhostTarget(
    ghost,
    pacman,
    blinky,
    globalMode,
    dotsLeft,
    level
  )
  const inHouse = isInsideGhostHouse(ghost.r, ghost.c)

  const validDirs = DIR_PRIORITY.filter((d) => {
    if (d === DIRS[ghost.dir].opposite) return false

    const nr = ghost.r + DIRS[d].dr
    const nc = ghost.c + DIRS[d].dc

    if (nr === 14 && (nc < 0 || nc >= COLS)) return true // row 14 wrap-around tunnel
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return false

    const tile = board[nr][nc]
    if (tile === 1 || tile === 9) return false

    // Only ghosts exiting the pen or returning as eaten eyes may pass through the pen door/interior (4, 5).
    if ((tile === 4 || tile === 5) && !inHouse && ghost.state !== "EATEN") {
      return false
    }

    // NORMAL ghosts cannot turn UP at the 4 intersections above the pen and Pac-Man's spawn.
    if (
      ghost.state === "NORMAL" &&
      d === "UP" &&
      (ghost.r === 11 || ghost.r === 23) &&
      (ghost.c === 12 || ghost.c === 15)
    ) {
      return false
    }

    return true
  })

  const candidates: readonly Direction[] =
    validDirs.length > 0 ? validDirs : [DIRS[ghost.dir].opposite]

  let chosenDir = candidates[0]

  if (ghost.state === "FRIGHTENED" && !inHouse) {
    chosenDir = candidates[Math.floor(Math.random() * candidates.length)]
  } else {
    let bestDist = Infinity
    for (const d of candidates) {
      const nr = ghost.r + DIRS[d].dr
      const nc = (ghost.c + DIRS[d].dc + COLS) % COLS
      const distSq =
        (nr - target.r) * (nr - target.r) + (nc - target.c) * (nc - target.c)
      if (distSq < bestDist) {
        bestDist = distSq
        chosenDir = d
      }
    }
  }

  return {
    ...ghost,
    r: ghost.r + DIRS[chosenDir].dr,
    c: (ghost.c + DIRS[chosenDir].dc + COLS) % COLS,
    dir: chosenDir,
    targetR: target.r,
    targetC: target.c,
  }
}
