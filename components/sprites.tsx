import {
  GHOST_BODY_FRAMES,
  PACMAN_DEATH_FRAMES,
  PACMAN_SPRITE_FRAMES,
} from "../lib/sprite-frames"
import { type Direction, type FruitType, type Ghost } from "../lib/types"

function rotateMatrix(
  matrix: readonly string[],
  dir: Direction
): readonly string[] {
  const N = matrix.length
  if (dir === "RIGHT") return matrix
  if (dir === "LEFT") {
    return matrix.map((row) => row.split("").reverse().join(""))
  }
  const res: string[] = []
  for (let r = 0; r < N; r++) {
    let rowStr = ""
    for (let c = 0; c < N; c++) {
      rowStr += dir === "DOWN" ? matrix[N - 1 - c][r] : matrix[c][N - 1 - r]
    }
    res.push(rowStr)
  }
  return res
}

export function PacmanSprite({
  dir,
  frame,
  size = "arcade",
}: {
  readonly dir: Direction
  readonly frame: number
  readonly size?: "arcade" | "hud"
}) {
  const isDying = frame >= 3
  const bitmap = isDying
    ? PACMAN_DEATH_FRAMES[Math.min(4, frame - 3)]
    : rotateMatrix(
        frame === 0
          ? PACMAN_SPRITE_FRAMES.closed
          : frame === 1
          ? PACMAN_SPRITE_FRAMES.halfRight
          : PACMAN_SPRITE_FRAMES.openRight,
        dir
      )

  const sizeClass =
    size === "arcade"
      ? "w-[34px] h-[34px] min-w-[34px] min-h-[34px]"
      : "w-[22px] h-[22px]"

  return (
    <svg
      viewBox="0 0 13 13"
      className={`${sizeClass} pointer-events-none select-none z-20`}
      shapeRendering="crispEdges"
    >
      {bitmap.map((row, y) =>
        row
          .split("")
          .map((ch, x) =>
            ch === "X" ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={isDying && frame === 7 ? "#ffb852" : "#ffff00"}
              />
            ) : null
          )
      )}
    </svg>
  )
}

export function GhostSprite({
  ghost,
  tick,
  frightenedTimer,
  size = "arcade",
}: {
  readonly ghost: Ghost
  readonly tick: number
  readonly frightenedTimer: number
  readonly size?: "arcade" | "hud"
}) {
  const bodyMatrix = GHOST_BODY_FRAMES[tick % 2]
  const isFlashing =
    ghost.state === "FRIGHTENED" &&
    frightenedTimer <= 10 &&
    frightenedTimer % 2 === 0

  const bodyColor =
    ghost.state === "FRIGHTENED"
      ? isFlashing
        ? "#ffffff"
        : "#2121ff"
      : ghost.color

  const eyeOffsets: Readonly<
    Record<
      Direction,
      {
        readonly ex: number
        readonly ey: number
        readonly px: number
        readonly py: number
      }
    >
  > = {
    LEFT: { ex: 2, ey: 3, px: 2, py: 5 },
    RIGHT: { ex: 4, ey: 3, px: 6, py: 5 },
    UP: { ex: 3, ey: 2, px: 4, py: 2 },
    DOWN: { ex: 3, ey: 4, px: 4, py: 6 },
  }

  const { ex, ey, px, py } = eyeOffsets[ghost.dir]
  const sizeClass =
    size === "arcade"
      ? "w-[36px] h-[34px] min-w-[36px] min-h-[34px]"
      : "w-[22px] h-[20px] min-w-[22px] min-h-[20px]"

  return (
    <svg
      viewBox="0 0 16 14"
      className={`${sizeClass} pointer-events-none select-none z-30`}
      shapeRendering="crispEdges"
    >
      {ghost.state !== "EATEN" &&
        bodyMatrix.map((row, y) =>
          row
            .split("")
            .map((ch, x) =>
              ch === "X" ? (
                <rect
                  key={`b-${x}-${y}`}
                  x={x}
                  y={y}
                  width={1}
                  height={1}
                  fill={bodyColor}
                />
              ) : null
            )
        )}

      {ghost.state === "FRIGHTENED" ? (
        <g fill={isFlashing ? "#ff0000" : "#ffb8ae"}>
          <rect x={4} y={5} width={2} height={2} />
          <rect x={10} y={5} width={2} height={2} />
          <rect x={2} y={10} width={2} height={1} />
          <rect x={4} y={9} width={2} height={1} />
          <rect x={6} y={10} width={4} height={1} />
          <rect x={10} y={9} width={2} height={1} />
          <rect x={12} y={10} width={2} height={1} />
        </g>
      ) : (
        <g>
          <rect x={ex + 1} y={ey} width={2} height={5} fill="#ffffff" />
          <rect x={ex} y={ey + 1} width={4} height={3} fill="#ffffff" />
          <rect x={px} y={py} width={2} height={2} fill="#2121ff" />

          <rect x={ex + 7} y={ey} width={2} height={5} fill="#ffffff" />
          <rect x={ex + 6} y={ey + 1} width={4} height={3} fill="#ffffff" />
          <rect x={px + 6} y={py} width={2} height={2} fill="#2121ff" />
        </g>
      )}
    </svg>
  )
}

export function FruitSprite({
  fruit,
  size = "arcade",
}: {
  readonly fruit: FruitType
  readonly size?: "arcade" | "hud"
}) {
  const sizeClass =
    size === "arcade"
      ? "w-[32px] h-[32px] min-w-[32px] min-h-[32px]"
      : "w-[22px] h-[22px]"

  if (fruit === "cherry") {
    return (
      <svg
        viewBox="0 0 12 12"
        className={sizeClass}
        shapeRendering="crispEdges"
      >
        <rect x={7} y={1} width={3} height={1} fill="#00ff00" />
        <rect x={5} y={2} width={2} height={1} fill="#de9751" />
        <rect x={8} y={2} width={1} height={3} fill="#de9751" />
        <rect x={4} y={3} width={1} height={2} fill="#de9751" />
        <rect x={3} y={5} width={1} height={2} fill="#de9751" />
        <rect x={7} y={5} width={1} height={2} fill="#de9751" />
        <rect x={1} y={7} width={4} height={4} fill="#ff0000" />
        <rect x={2} y={9} width={1} height={1} fill="#ffffff" />
        <rect x={6} y={7} width={4} height={4} fill="#ff0000" />
        <rect x={7} y={9} width={1} height={1} fill="#ffffff" />
      </svg>
    )
  }

  if (fruit === "strawberry") {
    return (
      <svg
        viewBox="0 0 12 12"
        className={sizeClass}
        shapeRendering="crispEdges"
      >
        <rect x={5} y={1} width={2} height={1} fill="#ffffff" />
        <rect x={3} y={2} width={6} height={1} fill="#00ff00" />
        <rect x={2} y={3} width={8} height={4} fill="#ff0000" />
        <rect x={3} y={7} width={6} height={2} fill="#ff0000" />
        <rect x={4} y={9} width={4} height={2} fill="#ff0000" />
        <rect x={5} y={11} width={2} height={1} fill="#ff0000" />
        <rect x={3} y={4} width={1} height={1} fill="#ffffff" />
        <rect x={6} y={4} width={1} height={1} fill="#ffffff" />
        <rect x={8} y={5} width={1} height={1} fill="#ffffff" />
        <rect x={4} y={6} width={1} height={1} fill="#ffffff" />
        <rect x={7} y={7} width={1} height={1} fill="#ffffff" />
        <rect x={5} y={9} width={1} height={1} fill="#ffffff" />
      </svg>
    )
  }

  if (fruit === "peach") {
    return (
      <svg
        viewBox="0 0 12 12"
        className={sizeClass}
        shapeRendering="crispEdges"
      >
        <rect x={5} y={1} width={2} height={2} fill="#de9751" />
        <rect x={7} y={2} width={3} height={1} fill="#00ff00" />
        <rect x={3} y={3} width={6} height={1} fill="#ffb852" />
        <rect x={2} y={4} width={8} height={5} fill="#ffb852" />
        <rect x={3} y={9} width={6} height={2} fill="#ffb852" />
        <rect x={4} y={5} width={1} height={2} fill="#ffffff" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 12 12" className={sizeClass} shapeRendering="crispEdges">
      <rect x={5} y={1} width={1} height={2} fill="#de9751" />
      <rect x={6} y={1} width={2} height={1} fill="#00ff00" />
      <rect x={2} y={3} width={3} height={1} fill="#ff0000" />
      <rect x={6} y={3} width={4} height={1} fill="#ff0000" />
      <rect x={1} y={4} width={10} height={5} fill="#ff0000" />
      <rect x={2} y={9} width={8} height={2} fill="#ff0000" />
      <rect x={3} y={11} width={2} height={1} fill="#ff0000" />
      <rect x={7} y={11} width={2} height={1} fill="#ff0000" />
      <rect x={8} y={5} width={1} height={2} fill="#ffb852" />
    </svg>
  )
}

export function PausePlayIcon({ paused }: { readonly paused: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className="w-4 h-4 shrink-0"
      shapeRendering="crispEdges"
    >
      {paused ? (
        <g fill="#00ff00">
          <rect x={3} y={2} width={2} height={8} />
          <rect x={5} y={3} width={2} height={6} />
          <rect x={7} y={4} width={2} height={4} />
          <rect x={9} y={5} width={1} height={2} />
        </g>
      ) : (
        <g fill="#ffff00">
          <rect x={3} y={2} width={2} height={8} />
          <rect x={7} y={2} width={2} height={8} />
        </g>
      )}
    </svg>
  )
}

export function ResetIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="w-4 h-4 shrink-0"
      shapeRendering="crispEdges"
    >
      <g fill="#ff0000">
        <rect x={4} y={2} width={5} height={1} />
        <rect x={9} y={3} width={1} height={5} />
        <rect x={4} y={9} width={5} height={1} />
        <rect x={2} y={5} width={1} height={4} />

        <rect x={2} y={2} width={3} height={1} />
        <rect x={3} y={1} width={1} height={3} />
      </g>
    </svg>
  )
}

export function SoundIcon({ enabled }: { readonly enabled: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className="w-4 h-4 shrink-0"
      shapeRendering="crispEdges"
    >
      <g fill={enabled ? "#ffb8ff" : "#71717a"}>
        <rect x={1} y={4} width={2} height={4} />
        <rect x={3} y={3} width={1} height={6} />
        <rect x={4} y={2} width={2} height={8} />
      </g>

      {enabled ? (
        <g fill="#00ffff">
          <rect x={7} y={4} width={1} height={1} />
          <rect x={8} y={5} width={1} height={2} />
          <rect x={7} y={7} width={1} height={1} />
          <rect x={9} y={2} width={1} height={2} />
          <rect x={10} y={4} width={1} height={4} />
          <rect x={9} y={8} width={1} height={2} />
        </g>
      ) : (
        <g fill="#ff0000">
          <rect x={7} y={4} width={1} height={1} />
          <rect x={10} y={4} width={1} height={1} />
          <rect x={8} y={5} width={2} height={2} />
          <rect x={7} y={7} width={1} height={1} />
          <rect x={10} y={7} width={1} height={1} />
        </g>
      )}
    </svg>
  )
}
