import { LEVEL_SPECS } from "../lib/constants"
import { GameState, LevelNumber } from "../lib/types"
import { arcadeFont } from "./arcade-hud"
import {
  FruitSprite,
  GhostSprite,
  PausePlayIcon,
  ResetIcon,
  SoundIcon,
} from "./sprites"

interface AiInspectorProps {
  readonly game: GameState
  readonly soundEnabled: boolean
  readonly onSelectLevel: (level: LevelNumber) => void
  readonly onTogglePause: () => void
  readonly onRestart: () => void
  readonly onToggleSound: () => void
}

const LEVELS: readonly LevelNumber[] = [1, 2, 3, 4, 5]

export function AiInspector({
  game,
  soundEnabled,
  onSelectLevel,
  onTogglePause,
  onRestart,
  onToggleSound,
}: AiInspectorProps) {
  const spec = LEVEL_SPECS[game.level]
  const isElroy = game.dotsLeft <= spec.elroy1Dots
  const currentAiLabel =
    game.frightenedTimer > 0 ? "FRIGHT" : game.globalMode
  const isPaused = game.status === "PAUSED"

  return (
    <aside
      className={`${arcadeFont.className} w-full max-w-140 lg:w-97.5 bg-black border-2 border-[#2121ff] p-3 flex flex-col gap-3 text-[10px] text-white shadow-[0_0_0_2px_#000000,0_0_0_4px_#2121ff]`}
    >
      <div className="flex items-center justify-between border-b-2 border-[#2121ff] pb-2.5">
        <div className="flex flex-col gap-1">
          <span className="text-[#ffff00] text-[11px] tracking-wider">
            MADE BY OUTSLEPT
          </span>
          <a
            href="https://github.com/outslept"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00ffff] hover:text-[#ffb8ff] text-[8px] tracking-wide underline underline-offset-2 transition-colors"
          >
            GITHUB.COM/OUTSLEPT &rarr;
          </a>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePause}
            title={isPaused ? "Resume (Space)" : "Pause (Space)"}
            aria-label={isPaused ? "Resume" : "Pause"}
            className={`w-8 h-8 border-2 flex items-center justify-center transition-colors cursor-pointer ${
              isPaused
                ? "border-[#00ff00] bg-[#00ff00]/15"
                : "border-[#2121ff] bg-black hover:border-[#ffff00]"
            }`}
          >
            <PausePlayIcon paused={isPaused} />
          </button>

          <button
            type="button"
            onClick={onRestart}
            title="Reset 1UP"
            aria-label="Reset Game"
            className="w-8 h-8 border-2 border-[#2121ff] bg-black hover:border-[#ff0000] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ResetIcon />
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? "Mute Audio" : "Enable Audio"}
            aria-label={soundEnabled ? "Mute Audio" : "Enable Audio"}
            className={`w-8 h-8 border-2 flex items-center justify-center transition-colors cursor-pointer ${
              soundEnabled
                ? "border-[#2121ff] bg-black hover:border-[#ffb8ff]"
                : "border-[#ff0000]/70 bg-black hover:border-[#ff0000]"
            }`}
          >
            <SoundIcon enabled={soundEnabled} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 border border-[#2121ff]/60 p-2 bg-black">
        <div className="flex items-center justify-between">
          <span className="text-[#ffb8ae] text-[9px]">DIP LEVEL SELECT</span>
          <div className="flex items-center gap-1.5">
            <FruitSprite fruit={spec.fruit} size="hud" />
            <span className="text-[#ffb8ff] text-[9px]">
              {spec.fruitPoints}PTS
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {LEVELS.map((lvl) => {
            const active = game.level === lvl
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onSelectLevel(lvl)}
                className={`py-1.5 border text-[9px] transition-colors cursor-pointer ${
                  active
                    ? "border-[#ffff00] bg-[#ffff00] text-black"
                    : "border-[#2121ff] bg-black text-white hover:border-[#00ffff] hover:text-[#00ffff]"
                }`}
              >
                L{lvl}
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-3 gap-1 pt-1 text-[8px] text-zinc-300 border-t border-zinc-900">
          <div>
            FRIGHT:{" "}
            <span className="text-[#00ffff]">
              {Math.round(spec.frightenedTicks / 6)}S
            </span>
          </div>
          <div>
            ELROY:{" "}
            <span className="text-[#ff0000]">&le;{spec.elroy1Dots}</span>
          </div>
          <div>
            TICK: <span className="text-[#ffff00]">{spec.tickMs}MS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="border border-[#2121ff]/60 p-2 flex flex-col gap-1">
          <span className="text-[8px] text-[#ffb8ae]">WAVE MODE</span>
          <span
            className={`text-[11px] ${
              game.frightenedTimer > 0
                ? "text-[#00ffff]"
                : game.globalMode === "CHASE"
                ? "text-[#ff0000]"
                : "text-[#ffff00]"
            }`}
          >
            {currentAiLabel}
          </span>
        </div>

        <div className="border border-[#2121ff]/60 p-2 flex flex-col gap-1">
          <span className="text-[8px] text-[#ffb8ae]">DOTS LEFT</span>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white">{game.dotsLeft}/244</span>
            {isElroy && (
              <span className="text-[8px] text-[#ff0000] animate-pulse">
                ELROY!
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[8px] text-[#ffb8ae]">
          <span>GHOST TARGET VECTORS</span>
          <span>PAC:({game.pacman.r},{game.pacman.c})</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {game.ghosts.map((g) => (
            <div
              key={g.id}
              className="border border-[#2121ff]/70 p-2 bg-black flex items-center gap-2"
            >
              <GhostSprite
                ghost={g}
                tick={game.tick}
                frightenedTimer={game.frightenedTimer}
                size="hud"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span
                  style={{ color: g.color }}
                  className="text-[9px] truncate"
                >
                  {g.name.toUpperCase()}
                </span>
                <span className="text-[8px] text-zinc-400">
                  POS:{g.r},{g.c}
                </span>
                <span className="text-[8px] text-[#ffff00]">
                  TGT:{g.targetR},{g.targetC}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
