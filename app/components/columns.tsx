"use client"

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { COLS } from "../constants"
import { type PacmanTableFeatures } from "../data-table-features"
import { type PacmanStore } from "@/app/hooks/use-pacman-game"
import { type MazeRow } from "@/app/types"
import { PacmanCell } from "./maze-cell"

const columnHelper = createColumnHelper<PacmanTableFeatures, MazeRow>()

export function createPacmanColumns(
  store: PacmanStore
): ColumnDef<PacmanTableFeatures, MazeRow>[] {
  return Array.from({ length: COLS }).map((_, colIndex) =>
    columnHelper.display({
      id: `c_${colIndex}`,
      header: () => (
        <span className="text-[8px] text-zinc-500 font-mono">{colIndex}</span>
      ),
      cell: ({ row }) => (
        <PacmanCell store={store} r={row.original.rowIndex} c={colIndex} />
      ),
    })
  )
}
