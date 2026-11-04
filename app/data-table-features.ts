import {
  columnVisibilityFeature,
  createPaginatedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  tableFeatures,
} from "@tanstack/react-table"

export const features = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  paginatedRowModel: createPaginatedRowModel(),
})

export type PacmanTableFeatures = typeof features
