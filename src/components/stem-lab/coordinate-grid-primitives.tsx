import { type FC, type PointerEvent as ReactPointerEvent } from 'react'

type GridLinesProps = { columns: number; rows: number; cellSize: number; axisColumn?: number; axisRow?: number }
type DraggableVertexProps = { cx: number; cy: number; radius?: number; fill?: string; stroke?: string; strokeWidth?: number; cursor?: string; onPointerDown?: (event: ReactPointerEvent<SVGCircleElement>) => void }

export const CoordinateGridLines: FC<GridLinesProps> = ({ columns, rows, cellSize, axisColumn, axisRow }) => <g aria-hidden="true">
  {Array.from({ length: columns + 1 }, (_, index) => <line key={`v${index}`} x1={index * cellSize} y1={0} x2={index * cellSize} y2={rows * cellSize} stroke={index === axisColumn ? '#526d82' : '#d5e3df'} strokeWidth={index === axisColumn ? 2 : 1} />)}
  {Array.from({ length: rows + 1 }, (_, index) => <line key={`h${index}`} x1={0} y1={index * cellSize} x2={columns * cellSize} y2={index * cellSize} stroke={index === axisRow ? '#526d82' : '#d5e3df'} strokeWidth={index === axisRow ? 2 : 1} />)}
</g>

export const DraggableVertex: FC<DraggableVertexProps> = ({ cx, cy, radius = 9, fill = 'var(--mui-palette-secondary-main)', stroke = '#fff', strokeWidth = 3, cursor = 'grab', onPointerDown }) => <circle cx={cx} cy={cy} r={radius} fill={fill} stroke={stroke} strokeWidth={strokeWidth} style={{ cursor, touchAction: 'none', transition: 'cx .25s ease, cy .25s ease' }} onPointerDown={onPointerDown} />
