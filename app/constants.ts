import { type Direction, type LevelNumber, type LevelSpec } from "./types"

export const ROWS = 31
export const COLS = 28

export const FRUIT_SPAWN_ROW = 17
export const FRUIT_SPAWN_COL = 13

export const READY_TICKS = 14
export const GHOST_FREEZE_TICKS = 5
export const DEATH_ANIM_TICKS = 10
export const LEVEL_CLEAR_TICKS = 12

export const LEVEL_SPECS: Readonly<Record<LevelNumber, LevelSpec>> = {
  1: {
    level: 1,
    fruit: "cherry",
    fruitPoints: 100,
    frightenedTicks: 36,
    elroy1Dots: 20,
    elroy2Dots: 10,
    tickMs: 165,
    releaseTicks: { blinky: 0, pinky: 4, inky: 18, clyde: 36 },
    scatterWaves: [
      { start: 0, end: 42 },
      { start: 162, end: 204 },
      { start: 324, end: 354 },
      { start: 474, end: 504 },
    ],
  },
  2: {
    level: 2,
    fruit: "strawberry",
    fruitPoints: 300,
    frightenedTicks: 30,
    elroy1Dots: 30,
    elroy2Dots: 15,
    tickMs: 148,
    releaseTicks: { blinky: 0, pinky: 2, inky: 8, clyde: 20 },
    scatterWaves: [
      { start: 0, end: 42 },
      { start: 162, end: 204 },
      { start: 324, end: 354 },
    ],
  },
  3: {
    level: 3,
    fruit: "peach",
    fruitPoints: 500,
    frightenedTicks: 24,
    elroy1Dots: 40,
    elroy2Dots: 20,
    tickMs: 148,
    releaseTicks: { blinky: 0, pinky: 2, inky: 4, clyde: 8 },
    scatterWaves: [
      { start: 0, end: 42 },
      { start: 162, end: 204 },
      { start: 324, end: 354 },
    ],
  },
  4: {
    level: 4,
    fruit: "peach",
    fruitPoints: 500,
    frightenedTicks: 18,
    elroy1Dots: 40,
    elroy2Dots: 20,
    tickMs: 148,
    releaseTicks: { blinky: 0, pinky: 2, inky: 4, clyde: 6 },
    scatterWaves: [
      { start: 0, end: 42 },
      { start: 162, end: 204 },
      { start: 324, end: 354 },
    ],
  },
  5: {
    level: 5,
    fruit: "apple",
    fruitPoints: 700,
    frightenedTicks: 12,
    elroy1Dots: 40,
    elroy2Dots: 20,
    tickMs: 132,
    releaseTicks: { blinky: 0, pinky: 1, inky: 3, clyde: 5 },
    scatterWaves: [
      { start: 0, end: 30 },
      { start: 150, end: 180 },
      { start: 300, end: 330 },
    ],
  },
}

export const OG_MAZE_TEMPLATE: readonly string[] = [
  "1111111111111111111111111111",
  "1222222222222112222222222221",
  "1211112111112112111112111121",
  "1311112111112112111112111131",
  "1211112111112112111112111121",
  "1222222222222222222222222221",
  "1211112112111111112112111121",
  "1211112112111111112112111121",
  "1222222112222112222112222221",
  "1111112111110110111112111111",
  "9999912111110110111112199999",
  "9999912110000000000112199999",
  "9999912110111441110112199999",
  "1111112110155555510112111111",
  "0000002000155555510002000000",
  "1111112110155555510112111111",
  "9999912110111111110112199999",
  "9999912110000000000112199999",
  "9999912110111111110112199999",
  "1111112110111111110112111111",
  "1222222222222112222222222221",
  "1211112111112112111112111121",
  "1211112111112112111112111121",
  "1322112222222002222222112231",
  "1112112112111111112112112111",
  "1112112112111111112112112111",
  "1222222112222112222112222221",
  "1211111111112112111111111121",
  "1211111111112112111111111121",
  "1222222222222222222222222221",
  "1111111111111111111111111111",
]

export const DIR_PRIORITY: readonly Direction[] = ["UP", "LEFT", "DOWN", "RIGHT"]

export const DIRS: Readonly<
  Record<Direction, { readonly dr: number; readonly dc: number; readonly opposite: Direction }>
> = {
  UP: { dr: -1, dc: 0, opposite: "DOWN" },
  LEFT: { dr: 0, dc: -1, opposite: "RIGHT" },
  DOWN: { dr: 1, dc: 0, opposite: "UP" },
  RIGHT: { dr: 0, dc: 1, opposite: "LEFT" },
}
