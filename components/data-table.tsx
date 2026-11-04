"use client"

import * as React from "react"
import {
  useTable,
  type ColumnDef,
  type ColumnVisibilityState,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type RowSelectionState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ROWS } from "../lib/constants"
import { features, type PacmanTableFeatures } from "../lib/data-table-features"

interface PacmanDataTableProps<TData extends RowData> {
  readonly columns: ColumnDef<PacmanTableFeatures, TData>[]
  readonly data: TData[]
  readonly showHeader?: boolean
  readonly rowSelection: RowSelectionState
  readonly onRowSelectionChange: OnChangeFn<RowSelectionState>
}

export const PacmanDataTable = React.memo(function PacmanDataTable<
  TData extends RowData
>({
  columns,
  data,
  showHeader = false,
  rowSelection,
  onRowSelectionChange,
}: PacmanDataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: ROWS,
  })

  const table = useTable({
    features,
    data,
    columns,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange,
    onPaginationChange: setPagination,
    state: {
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  return (
    <Table className="w-auto border-collapse border-spacing-0 bg-black overflow-visible">
      {showHeader && (
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-zinc-800 hover:bg-transparent"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="p-0 h-5 text-center">
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
      )}

      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className="border-0 hover:bg-transparent data-[state=selected]:bg-red-950/40"
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className="p-0 m-0 w-5 h-5 align-middle border-0 overflow-visible"
              >
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}) as <TData extends RowData>(
  props: PacmanDataTableProps<TData>
) => React.ReactElement
