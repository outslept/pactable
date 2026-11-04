export type Direction = "UP" | "LEFT" | "DOWN" | "RIGHT"
export type GhostId = "blinky" | "pinky" | "inky" | "clyde"
export type GhostMode = "SCATTER" | "CHASE"
export type GhostState = "NORMAL" | "FRIGHTENED" | "EATEN"

export type GameStatus =
  | "READY"
  | "PLAYING"
  | "GHOST_EATEN"
  | "DYING"
  | "PAUSED"
  | "LEVEL_CLEAR"
  | "WON"
  | "GAME_OVER"

export type LevelNumber = 1 | 2 | 3 | 4 | 5
export type FruitType = "cherry" | "strawberry" | "peach" | "apple"
export type GhostScoreValue = 200 | 400 | 800 | 1600
export type FruitScoreValue = 100 | 300 | 500 | 700
export type ScorePopupValue = GhostScoreValue | FruitScoreValue

export type SoundEvent =
  | { readonly type: "START_MELODY" }
  | { readonly type: "WAKA"; readonly phase: 0 | 1 }
  | { readonly type: "EAT_ENERGIZER" }
  | { readonly type: "EAT_GHOST" }
  | { readonly type: "EAT_FRUIT" }
  | { readonly type: "PACMAN_DEATH" }
  | { readonly type: "LEVEL_CLEAR" }
  | { readonly type: "SIREN"; readonly frightened: boolean; readonly tick: number }

export interface ScatterWave {
  readonly start: number
  readonly end: number
}

export interface LevelSpec {
  readonly level: LevelNumber
  readonly fruit: FruitType
  readonly fruitPoints: FruitScoreValue
  readonly frightenedTicks: number
  readonly elroy1Dots: number
  readonly elroy2Dots: number
  readonly tickMs: number
  readonly releaseTicks: Readonly<Record<GhostId, number>>
  readonly scatterWaves: readonly ScatterWave[]
}

export interface BonusFruitState {
  readonly active: boolean
  readonly timer: number
  readonly scorePopup: FruitScoreValue | null
  readonly popupTimer: number
}

export interface GhostPopupState {
  readonly r: number
  readonly c: number
  readonly points: GhostScoreValue
  readonly timer: number
}

export interface Ghost {
  readonly id: GhostId
  readonly name: string
  readonly color: string
  readonly r: number
  readonly c: number
  readonly dir: Direction
  readonly targetR: number
  readonly targetC: number
  readonly state: GhostState
  readonly releaseTick: number
}

export interface PacmanEntity {
  readonly r: number
  readonly c: number
  readonly dir: Direction
  readonly nextDir: Direction
  readonly frame: number
}

export interface GameState {
  readonly level: LevelNumber
  readonly board: readonly (readonly number[])[]
  readonly pacman: PacmanEntity
  readonly ghosts: readonly Ghost[]
  readonly bonusFruit: BonusFruitState
  readonly ghostPopup: GhostPopupState | null
  readonly score: number
  readonly highScore: number
  readonly lives: number
  readonly dotsLeft: number
  readonly dotsEaten: number
  readonly tick: number
  readonly frightenedTimer: number
  readonly ghostCombo: number
  readonly globalMode: GhostMode
  readonly statusTimer: number
  readonly status: GameStatus
}

export interface EngineStepResult {
  readonly state: GameState
  readonly sounds: readonly SoundEvent[]
}

export type MazeRow = {
  readonly rowIndex: number
  readonly cells: readonly number[]
}
