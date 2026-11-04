import { Press_Start_2P } from "next/font/google"
import { LEVEL_SPECS } from "../constants"
import { OgFruitSprite, OgPacmanSprite } from "./sprites"
import { GameStatus, LevelNumber } from "../types"

export const arcadeFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
})

export function ArcadeTopHud({
  score,
  highScore,
  level,
}: {
  readonly score: number
  readonly highScore: number
  readonly level: LevelNumber
}) {
  return (
    <div
      className={`${arcadeFont.className} w-full max-w-140 grid grid-cols-3 text-white text-sm tracking-wider mb-1.5 leading-tight`}
    >
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-[#ffb8ae]">1UP (L{level})</span>
        <span className="text-[#ffff00]">{score || "00"}</span>
      </div>
      <div className="flex flex-col items-center whitespace-nowrap">
        <span className="text-[10px] text-[#ff0000]">HIGH SCORE</span>
        <span>{highScore || "00"}</span>
      </div>
    </div>
  )
}

export function ArcadeBottomHud({
  lives,
  level,
}: {
  readonly lives: number
  readonly level: LevelNumber
}) {
  const levelProgression = ([1, 2, 3, 4, 5] as const).filter(
    (lvl) => lvl <= level
  )

  return (
    <div className="w-full max-w-140 flex items-center justify-between px-3 mt-1.5 h-6">
      <div className="flex items-center gap-2">
        {Array.from({ length: Math.max(0, lives - 1) }).map((_, i) => (
          <OgPacmanSprite key={i} dir="LEFT" frame={1} size="hud" />
        ))}
      </div>

      <div className="flex items-center gap-1.5 flex-row-reverse">
        {levelProgression.map((lvl) => (
          <OgFruitSprite key={lvl} fruit={LEVEL_SPECS[lvl].fruit} size="hud" />
        ))}
      </div>
    </div>
  )
}

export function ArcadeStatusOverlay({
  status,
  level,
}: {
  readonly status: GameStatus
  readonly level: LevelNumber
}) {
  if (
    status === "PLAYING" ||
    status === "LEVEL_CLEAR" ||
    status === "GHOST_EATEN" ||
    status === "DYING"
  ) {
    return null
  }

  if (status === "READY" || status === "GAME_OVER") {
    return (
      <div
        className={`${arcadeFont.className} absolute left-1/2 top-[56.2%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40`}
      >
        {status === "READY" ? (
          <span className="text-[#ffff00] text-xs tracking-[0.2em] bg-black px-1">
            READY!
          </span>
        ) : (
          <span className="text-[#ff0000] text-xs tracking-[0.15em] bg-black px-1">
            GAME OVER
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={`${arcadeFont.className} absolute inset-0 flex items-center justify-center pointer-events-none z-40`}
    >
      <div className="bg-black/95 border-2 border-[#2121ff] px-4 py-2.5 text-center shadow-[0_0_20px_rgba(33,33,255,0.5)]">
        {status === "WON" && (
          <span className="text-[#ffff00] text-xs">ALL 5 LEVELS CLEAR!</span>
        )}
        {status === "PAUSED" && (
          <span className="text-[#ffff00] text-xs">LEVEL {level} PAUSED</span>
        )}
      </div>
    </div>
  )
}
