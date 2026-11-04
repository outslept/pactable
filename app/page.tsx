"use client"

import * as React from "react"
import { type RowSelectionState } from "@tanstack/react-table"

import { createPacmanColumns } from "../components/columns"
import { AiInspector } from "../components/ai-inspector"
import {
  ArcadeBottomHud,
  ArcadeStatusOverlay,
  ArcadeTopHud,
} from "../components/arcade-hud"
import { PacmanDataTable } from "../components/data-table"
import { COLS, ROWS } from "../lib/constants"
import { type MazeRow } from "../lib/types"
import { usePacmanGame } from "@/hooks/use-pacman-game"

const STATIC_MAZE_DATA: MazeRow[] = Array.from(
  { length: ROWS },
  (_, rowIndex) => ({
    rowIndex,
    cells: Array.from({ length: COLS }, () => 0),
  })
)

export default function PacmanPage() {
  const {
    store,
    game,
    soundEnabled,
    toggleSound,
    togglePause,
    restartGame,
    selectLevel,
  } = usePacmanGame()

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const columns = React.useMemo(() => createPacmanColumns(store), [store])

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-black text-white flex flex-col lg:flex-row items-center justify-center gap-6 px-3 py-2 select-none">
      <div className="bg-black flex flex-col items-center shrink-0">
        <ArcadeTopHud
          score={game.score}
          highScore={game.highScore}
          level={game.level}
        />

        <div className="relative bg-black">
          <PacmanDataTable
            columns={columns}
            data={STATIC_MAZE_DATA}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
          <ArcadeStatusOverlay status={game.status} level={game.level} />
        </div>

        <ArcadeBottomHud lives={game.lives} level={game.level} />
      </div>

      <AiInspector
        game={game}
        soundEnabled={soundEnabled}
        onSelectLevel={selectLevel}
        onTogglePause={togglePause}
        onRestart={restartGame}
        onToggleSound={toggleSound}
      />
    </main>
  )
}
