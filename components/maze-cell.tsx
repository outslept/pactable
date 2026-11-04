"use client"

import * as React from "react"
import { COLS, ROWS } from "../lib/constants"
import { useCellPackedState, type PacmanStore } from "@/hooks/use-pacman-game"
import {
  FruitSprite,
  GhostSprite,
  PacmanSprite,
} from "./sprites"
import { unpackCellState } from "../lib/cell-packing"

const WALL_INSET = 5
const WALL_BORDER = 2
const CORNER_SIZE = WALL_INSET + WALL_BORDER

function WallTile({
  board,
  r,
  c,
  wallColor,
}: {
  readonly board: readonly (readonly number[])[]
  readonly r: number
  readonly c: number
  readonly wallColor: string
}) {
  const isSolid = (nr: number, nc: number) => {
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return true
    const t = board[nr][nc]
    return t === 1 || t === 4 || t === 9
  }

  const topOpen = r === 0 || !isSolid(r - 1, c)
  const bottomOpen = r === ROWS - 1 || !isSolid(r + 1, c)
  const leftOpen = c === 0 || !isSolid(r, c - 1)
  const rightOpen = c === COLS - 1 || !isSolid(r, c + 1)

  const concaveTL = !topOpen && !leftOpen && !isSolid(r - 1, c - 1)
  const concaveTR = !topOpen && !rightOpen && !isSolid(r - 1, c + 1)
  const concaveBL = !bottomOpen && !leftOpen && !isSolid(r + 1, c - 1)
  const concaveBR = !bottomOpen && !rightOpen && !isSolid(r + 1, c + 1)

  const mainBoxStyle: React.CSSProperties = {
    position: "absolute",
    top: topOpen ? WALL_INSET : 0,
    bottom: bottomOpen ? WALL_INSET : 0,
    left: leftOpen ? WALL_INSET : 0,
    right: rightOpen ? WALL_INSET : 0,
    borderTop: topOpen ? `${WALL_BORDER}px solid ${wallColor}` : undefined,
    borderBottom: bottomOpen
      ? `${WALL_BORDER}px solid ${wallColor}`
      : undefined,
    borderLeft: leftOpen ? `${WALL_BORDER}px solid ${wallColor}` : undefined,
    borderRight: rightOpen ? `${WALL_BORDER}px solid ${wallColor}` : undefined,
    borderTopLeftRadius: topOpen && leftOpen ? "5px" : undefined,
    borderTopRightRadius: topOpen && rightOpen ? "5px" : undefined,
    borderBottomLeftRadius: bottomOpen && leftOpen ? "5px" : undefined,
    borderBottomRightRadius: bottomOpen && rightOpen ? "5px" : undefined,
  }

  return (
    <>
      <div style={mainBoxStyle} className="pointer-events-none" />
      {concaveTL && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderRight: `${WALL_BORDER}px solid ${wallColor}`,
            borderBottom: `${WALL_BORDER}px solid ${wallColor}`,
            borderBottomRightRadius: "4px",
          }}
          className="pointer-events-none"
        />
      )}
      {concaveTR && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderLeft: `${WALL_BORDER}px solid ${wallColor}`,
            borderBottom: `${WALL_BORDER}px solid ${wallColor}`,
            borderBottomLeftRadius: "4px",
          }}
          className="pointer-events-none"
        />
      )}
      {concaveBL && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderRight: `${WALL_BORDER}px solid ${wallColor}`,
            borderTop: `${WALL_BORDER}px solid ${wallColor}`,
            borderTopRightRadius: "4px",
          }}
          className="pointer-events-none"
        />
      )}
      {concaveBR && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: CORNER_SIZE,
            height: CORNER_SIZE,
            borderLeft: `${WALL_BORDER}px solid ${wallColor}`,
            borderTop: `${WALL_BORDER}px solid ${wallColor}`,
            borderTopLeftRadius: "4px",
          }}
          className="pointer-events-none"
        />
      )}
    </>
  )
}

export const PacmanCell = React.memo(function PacmanCell({
  store,
  r,
  c,
}: {
  readonly store: PacmanStore
  readonly r: number
  readonly c: number
}) {
  const packed = useCellPackedState(store, r, c)
  store.recordCellRender()

  const {
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
  } = unpackCellState(packed)

  return (
    <div className="relative w-5 h-5 bg-black flex items-center justify-center overflow-visible select-none">
      {tile === 1 && (
        <WallTile
          board={store.getState().board}
          r={r}
          c={c}
          wallColor={wallFlash ? "#ffffff" : "#2121ff"}
        />
      )}

      {tile === 4 && (
        <div className="w-full h-1 bg-[#ffb8ff] self-center" />
      )}

      {tile === 2 && <div className="size-1.25 bg-[#ffb8ae]" />}

      {tile === 3 && (
        <div
          className={`w-3.5 h-3.5 rounded-full bg-[#ffb8ae] ${
            !energizerBlink ? "opacity-100" : "opacity-20"
          }`}
        />
      )}

      {activeFruit && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <FruitSprite fruit={activeFruit} size="arcade" />
        </div>
      )}

      {scorePopup !== null && (
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 text-[11px] font-extrabold font-mono whitespace-nowrap pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,1)] ${
            isGhostPopup ? "text-[#00ffff]" : "text-[#ffb8ff]"
          }`}
        >
          {scorePopup}
        </span>
      )}

      {hasPac && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <PacmanSprite dir={pacDir} frame={pacFrame} size="arcade" />
        </div>
      )}

      {ghost && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <GhostSprite
            ghost={ghost}
            tick={ghostAnim}
            frightenedTimer={ghostFlash ? 2 : 99}
          />
        </div>
      )}
    </div>
  )
})
