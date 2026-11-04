import {
  FRUIT_SPAWN_COL,
  FRUIT_SPAWN_ROW,
  LEVEL_SPECS,
} from "./constants"
import {
  type Direction,
  type FruitType,
  type GameState,
  type Ghost,
  type GhostId,
  type ScorePopupValue,
} from "./types"

const DIR_TO_INT: Readonly<Record<Direction, number>> = {
  UP: 0,
  LEFT: 1,
  DOWN: 2,
  RIGHT: 3,
}

const INT_TO_DIR: readonly Direction[] = ["UP", "LEFT", "DOWN", "RIGHT"]

const GHOST_ID_TO_INT: Readonly<Record<GhostId, number>> = {
  blinky: 1,
  pinky: 2,
  inky: 3,
  clyde: 4,
}

const GHOST_META: Readonly<
  Record<
    number,
    { readonly id: GhostId; readonly name: string; readonly color: string }
  >
> = {
  1: { id: "blinky", name: "Blinky", color: "#ff0000" },
  2: { id: "pinky", name: "Pinky", color: "#ffb8ff" },
  3: { id: "inky", name: "Inky", color: "#00ffff" },
  4: { id: "clyde", name: "Clyde", color: "#ffb852" },
}

// Overlay codes 1..12 share a single 4-bit slot (bits 21..24):
// 1..4 = active fruit, 5..8 = fruit score, 9..12 = ghost score
const FRUIT_TO_INT: Readonly<Record<FruitType, number>> = {
  cherry: 1,
  strawberry: 2,
  peach: 3,
  apple: 4,
}

const INT_TO_FRUIT: Readonly<Record<number, FruitType>> = {
  1: "cherry",
  2: "strawberry",
  3: "peach",
  4: "apple",
}

const POPUP_TO_INT: Readonly<Record<ScorePopupValue, number>> = {
  100: 5,
  300: 6,
  500: 7,
  700: 8,
  200: 9,
  400: 10,
  800: 11,
  1600: 12,
}

const INT_TO_POPUP: Readonly<Record<number, ScorePopupValue>> = {
  5: 100,
  6: 300,
  7: 500,
  8: 700,
  9: 200,
  10: 400,
  11: 800,
  12: 1600,
}

/**
 * Bit layout:
 * - [0..3]   tile           (4 bits: 0..9 maze tile type)
 * - [4]      wallFlash      (1 bit: white/blue toggle during LEVEL_CLEAR)
 * - [5]      energizerBlink (1 bit: 1Hz blink for energizer pellets)
 * - [6]      hasPac         (1 bit: Pac-Man is on this cell)
 * - [7..8]   pacDir         (2 bits: UP, LEFT, DOWN, RIGHT)
 * - [9..11]  pacFrame       (3 bits: 0..2 chew cycle, 3..7 death animation)
 * - [12..14] ghostIdx       (3 bits: 0 = none, 1..4 = Blinky..Clyde)
 * - [15..16] ghostDir       (2 bits: eye look direction)
 * - [17..18] ghostState     (2 bits: 0 = NORMAL, 1 = FRIGHTENED, 2 = EATEN)
 * - [19]     ghostAnim      (1 bit: 2-frame skirt animation)
 * - [20]     ghostFlash     (1 bit: white flash when frightened timer <= 10)
 * - [21..24] overlayCode    (4 bits: fruit sprite or score popup)
 * - [25..26] wallVer        (2 bits: invalidates wall cells when board topology changes)
 */
export function packCellState(
  game: GameState,
  r: number,
  c: number,
  wallVersion: number
): number {
  const tile = game.board[r][c] & 0xf

  const wallFlash =
    tile === 1 &&
    game.status === "LEVEL_CLEAR" &&
    game.statusTimer % 2 === 1
      ? 1
      : 0

  const energizerBlink = tile === 3 ? game.tick & 1 : 0

  // This behavior feels a bit weird and not natural.
  // TODO: Revisit this later to evaluate
  const isGhostFreezeCell =
    game.status === "GHOST_EATEN" &&
    game.ghostPopup !== null &&
    game.ghostPopup.r === r &&
    game.ghostPopup.c === c

  const hasPac =
    !isGhostFreezeCell && game.pacman.r === r && game.pacman.c === c ? 1 : 0
  const pacDir = hasPac ? DIR_TO_INT[game.pacman.dir] : 0
  const pacFrame = hasPac ? game.pacman.frame & 0x7 : 0

  let ghostIdx = 0
  let ghostDir = 0
  let ghostState = 0
  let ghostAnim = 0
  let ghostFlash = 0

  // Hide ghosts during death and level-clear animations
  if (
    game.status !== "LEVEL_CLEAR" &&
    game.status !== "DYING" &&
    !isGhostFreezeCell
  ) {
    for (let i = 0; i < game.ghosts.length; i++) {
      const g = game.ghosts[i]
      if (g.r === r && g.c === c) {
        ghostIdx = GHOST_ID_TO_INT[g.id]
        ghostDir = DIR_TO_INT[g.dir]
        ghostState =
          g.state === "NORMAL" ? 0 : g.state === "FRIGHTENED" ? 1 : 2
        ghostAnim = game.tick & 1
        ghostFlash =
          g.state === "FRIGHTENED" &&
          game.frightenedTimer <= 10 &&
          game.frightenedTimer % 2 === 0
            ? 1
            : 0
        break
      }
    }
  }

  let overlayCode = 0
  if (
    game.ghostPopup !== null &&
    game.ghostPopup.r === r &&
    game.ghostPopup.c === c
  ) {
    overlayCode = POPUP_TO_INT[game.ghostPopup.points] ?? 0
  } else if (r === FRUIT_SPAWN_ROW && c === FRUIT_SPAWN_COL) {
    if (game.bonusFruit.active) {
      overlayCode = FRUIT_TO_INT[LEVEL_SPECS[game.level].fruit]
    } else if (game.bonusFruit.scorePopup !== null) {
      overlayCode = POPUP_TO_INT[game.bonusFruit.scorePopup] ?? 0
    }
  }

  const wallVer = tile === 1 ? wallVersion & 0x3 : 0

  return (
    tile |
    (wallFlash << 4) |
    (energizerBlink << 5) |
    (hasPac << 6) |
    (pacDir << 7) |
    (pacFrame << 9) |
    (ghostIdx << 12) |
    (ghostDir << 15) |
    (ghostState << 17) |
    (ghostAnim << 19) |
    (ghostFlash << 20) |
    (overlayCode << 21) |
    (wallVer << 25)
  )
}

export interface UnpackedCellState {
  readonly tile: number
  readonly wallFlash: boolean
  readonly energizerBlink: boolean
  readonly hasPac: boolean
  readonly pacDir: Direction
  readonly pacFrame: number
  readonly ghost: Ghost | null
  readonly ghostAnim: number
  readonly ghostFlash: boolean
  readonly activeFruit: FruitType | null
  readonly scorePopup: ScorePopupValue | null
  readonly isGhostPopup: boolean
}

/**
 * Decodes the packed 27-bit integer back into props for `<PacmanCell />`.
 * Called only inside cells whose packed value actually changed this tick
 */
export function unpackCellState(packed: number): UnpackedCellState {
  const tile = packed & 0xf
  const wallFlash = ((packed >> 4) & 0x1) === 1
  const energizerBlink = ((packed >> 5) & 0x1) === 1
  const hasPac = ((packed >> 6) & 0x1) === 1
  const pacDir = INT_TO_DIR[(packed >> 7) & 0x3]
  const pacFrame = (packed >> 9) & 0x7

  const ghostIdx = (packed >> 12) & 0x7
  const ghostDir = INT_TO_DIR[(packed >> 15) & 0x3]
  const ghostStateCode = (packed >> 17) & 0x3
  const ghostAnim = (packed >> 19) & 0x1
  const ghostFlash = ((packed >> 20) & 0x1) === 1

  const overlayCode = (packed >> 21) & 0xf

  let ghost: Ghost | null = null
  if (ghostIdx > 0) {
    const meta = GHOST_META[ghostIdx]
    ghost = {
      id: meta.id,
      name: meta.name,
      color: meta.color,
      r: 0,
      c: 0,
      dir: ghostDir,
      targetR: 0,
      targetC: 0,
      state:
        ghostStateCode === 0
          ? "NORMAL"
          : ghostStateCode === 1
          ? "FRIGHTENED"
          : "EATEN",
      releaseTick: 0,
    }
  }

  const activeFruit =
    overlayCode >= 1 && overlayCode <= 4 ? INT_TO_FRUIT[overlayCode] : null
  const scorePopup =
    overlayCode >= 5 ? INT_TO_POPUP[overlayCode] ?? null : null
  // Codes 9..12 are ghost scores (rendered in cyan); 5..8 are fruit scores (rendered in pink).
  const isGhostPopup = overlayCode >= 9

  return {
    tile,
    wallFlash,
    energizerBlink,
    hasPac,
    pacDir,
    pacFrame,
    ghost,
    ghostAnim,
    ghostFlash,
    activeFruit,
    scorePopup,
    isGhostPopup,
  }
}
