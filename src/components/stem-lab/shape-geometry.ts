export const COLS = 16
export const ROWS = 12

export const SHAPE_NAMES = ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon'] as const
export type ShapeName = (typeof SHAPE_NAMES)[number]
export type Point = { x: number; y: number }
export type ShapeSpec = { shape: ShapeName; sideLength?: number }
export type Stage = 'build' | 'fix' | 'name'
export type Round = { stage: Stage; spec: ShapeSpec; points: Point[] }
export type CheckStatus = 'pass' | 'fail' | 'not-required'
export type PropertyCheck = { id: string; label: string; status: CheckStatus; problem: string }

type Rule = { sides: number; equalSides: boolean; oppositeEqual: boolean; rightAngles: boolean }

const RULES: Record<ShapeName, Rule> = {
  triangle: { sides: 3, equalSides: false, oppositeEqual: false, rightAngles: false },
  square: { sides: 4, equalSides: true, oppositeEqual: true, rightAngles: true },
  rectangle: { sides: 4, equalSides: false, oppositeEqual: true, rightAngles: true },
  pentagon: { sides: 5, equalSides: false, oppositeEqual: false, rightAngles: false },
  hexagon: { sides: 6, equalSides: false, oppositeEqual: false, rightAngles: false },
}

const STAGE_PLAN: Stage[] = ['build', 'build', 'fix', 'fix', 'name']

const TEMPLATES: Record<'pentagon' | 'hexagon', Point[]> = {
  pentagon: [{ x: 4, y: 0 }, { x: 8, y: 2 }, { x: 7, y: 6 }, { x: 1, y: 6 }, { x: 0, y: 2 }],
  hexagon: [{ x: 3, y: 0 }, { x: 9, y: 0 }, { x: 12, y: 4 }, { x: 9, y: 8 }, { x: 3, y: 8 }, { x: 0, y: 4 }],
}

export const sidesOf = (shape: ShapeName) => RULES[shape].sides

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

function pick<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)]
}

const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y })
const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x
const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y
const squared = (a: Point) => dot(a, a)

const sideVectors = (points: Point[]) => points.map((point, index) => sub(points[(index + 1) % points.length], point))

const cornerVectors = (points: Point[], index: number) => ({
  toPrevious: sub(points[(index - 1 + points.length) % points.length], points[index]),
  toNext: sub(points[(index + 1) % points.length], points[index]),
})

export const sideLengths = (points: Point[]) => sideVectors(points).map((vector) => Math.sqrt(squared(vector)))

const squaredSideLengths = (points: Point[]) => sideVectors(points).map(squared)

export const rightCorners = (points: Point[]) =>
  points.map((_, index) => {
    const { toPrevious, toNext } = cornerVectors(points, index)
    return squared(toPrevious) > 0 && squared(toNext) > 0 && dot(toPrevious, toNext) === 0
  })

const orientation = (points: Point[]) =>
  points.reduce((sum, point, index) => sum + cross(point, points[(index + 1) % points.length]), 0) < 0 ? -1 : 1

export const cornerAngles = (points: Point[]) => {
  const turn = orientation(points)
  return points.map((_, index) => {
    const { toPrevious, toNext } = cornerVectors(points, index)
    const denominator = Math.sqrt(squared(toPrevious) * squared(toNext))
    if (denominator === 0) return 0
    const between = (Math.acos(clamp(dot(toPrevious, toNext) / denominator, -1, 1)) * 180) / Math.PI
    return cross(toPrevious, toNext) * turn < 0 ? between : 360 - between
  })
}

const turnSign = (a: Point, b: Point, c: Point) => Math.sign(cross(sub(b, a), sub(c, a)))

const withinBox = (a: Point, b: Point, p: Point) =>
  Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x) && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y)

const segmentsMeet = (a: Point, b: Point, c: Point, d: Point) => {
  const d1 = turnSign(c, d, a)
  const d2 = turnSign(c, d, b)
  const d3 = turnSign(a, b, c)
  const d4 = turnSign(a, b, d)
  if (d1 * d2 < 0 && d3 * d4 < 0) return true
  return (d1 === 0 && withinBox(c, d, a)) || (d2 === 0 && withinBox(c, d, b)) || (d3 === 0 && withinBox(a, b, c)) || (d4 === 0 && withinBox(a, b, d))
}

const selfCrosses = (points: Point[]) => {
  const count = points.length
  for (let i = 0; i < count; i++) {
    for (let j = i + 2; j < count; j++) {
      if (i === 0 && j === count - 1) continue
      if (segmentsMeet(points[i], points[(i + 1) % count], points[j], points[(j + 1) % count])) return true
    }
  }
  return false
}

export const formatLength = (value: number) => Number(value.toFixed(1)).toString()
const formatList = (values: number[]) => values.map(formatLength).join(', ')
const formatDegrees = (value: number) => `${Math.round(value)}°`

const passFail = (ok: boolean): CheckStatus => (ok ? 'pass' : 'fail')

export const evaluateShape = (points: Point[], spec: ShapeSpec): PropertyCheck[] => {
  const rule = RULES[spec.shape]
  const requestedLength = spec.sideLength
  const count = points.length
  const lengths = sideLengths(points)
  const squares = squaredSideLengths(points)
  const vectors = sideVectors(points)
  const angles = cornerAngles(points)
  const right = rightCorners(points)
  const flat = points.findIndex((_, index) => {
    const { toPrevious, toNext } = cornerVectors(points, index)
    return cross(toPrevious, toNext) === 0
  })
  const distinct = new Set(points.map((point) => `${point.x},${point.y}`)).size
  const sameLength = squares.every((value) => value === squares[0])
  const opposite =
    count === 4 &&
    squares[0] === squares[2] &&
    squares[1] === squares[3] &&
    cross(vectors[0], vectors[2]) === 0 &&
    cross(vectors[1], vectors[3]) === 0
  const vertexOk = count === rule.sides && distinct === count && flat === -1
  const vertexProblem =
    distinct < count
      ? 'Two corners sit on the same dot.'
      : flat !== -1
        ? `Corner ${flat + 1} is a straight line, not a corner.`
        : `Your shape has ${count} vertices, but a ${spec.shape} needs ${rule.sides}.`

  return [
    {
      id: 'sides',
      label: `Number of sides: ${count} (needs ${rule.sides})`,
      status: passFail(count === rule.sides),
      problem: `Your shape has ${count} sides, but a ${spec.shape} needs ${rule.sides}.`,
    },
    {
      id: 'vertices',
      label: `Number of vertices: ${count} (needs ${rule.sides})`,
      status: passFail(vertexOk),
      problem: vertexProblem,
    },
    {
      id: 'closed',
      label: 'Closed, with no crossing sides',
      status: passFail(!selfCrosses(points)),
      problem: 'Your shape crosses itself.',
    },
    {
      id: 'equal',
      label: 'All sides equal',
      status: rule.equalSides ? passFail(sameLength) : 'not-required',
      problem: `Your sides are not all equal (${formatList(lengths)}).`,
    },
    ...(requestedLength === undefined
      ? []
      : [
          {
            id: 'length',
            label: `Each side is ${requestedLength} units`,
            status: passFail(squares.every((value) => value === requestedLength * requestedLength)),
            problem: `Each side should be ${requestedLength} units, but your sides are (${formatList(lengths)}).`,
          },
        ]),
    {
      id: 'opposite',
      label: 'Opposite sides equal and parallel',
      status: rule.oppositeEqual ? passFail(opposite) : 'not-required',
      problem: 'Your opposite sides are not equal and parallel.',
    },
    {
      id: 'right',
      label: 'Right angles at every corner',
      status: rule.rightAngles ? passFail(right.every(Boolean)) : 'not-required',
      problem: `Your corners are not all right angles (${angles.map(formatDegrees).join(', ')}).`,
    },
  ]
}

export const isShapeValid = (points: Point[], spec: ShapeSpec) =>
  evaluateShape(points, spec).every((check) => check.status !== 'fail')

const placeRectangle = (width: number, height: number): Point[] => {
  const x = randomInt(1, COLS - 1 - width)
  const y = randomInt(1, ROWS - 1 - height)
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ]
}

const placeTemplate = (template: Point[]): Point[] => {
  const maxX = Math.max(...template.map((point) => point.x))
  const maxY = Math.max(...template.map((point) => point.y))
  const dx = randomInt(1, COLS - 1 - maxX)
  const dy = randomInt(1, ROWS - 1 - maxY)
  return template.map((point) => ({ x: point.x + dx, y: point.y + dy }))
}

const randomTriangle = (): Point[] => {
  for (;;) {
    const points = Array.from({ length: 3 }, () => ({ x: randomInt(1, COLS - 1), y: randomInt(1, ROWS - 1) }))
    if (isShapeValid(points, { shape: 'triangle' })) return points
  }
}

export const createShapePoints = (shape: ShapeName, sideLength?: number): Point[] => {
  if (shape === 'square') {
    const side = sideLength ?? randomInt(2, 6)
    return placeRectangle(side, side)
  }
  if (shape === 'rectangle') {
    const width = randomInt(2, 8)
    let height = randomInt(2, 6)
    while (height === width) height = randomInt(2, 6)
    return placeRectangle(width, height)
  }
  if (shape === 'triangle') return randomTriangle()
  return placeTemplate(TEMPLATES[shape])
}

export const parkedPoints = (count: number): Point[] =>
  Array.from({ length: count }, (_, index) => ({ x: 2 + index * 2, y: ROWS - 1 }))

const misplacePoints = (points: Point[], spec: ShapeSpec): Point[] => {
  for (let attempt = 0; attempt < 50; attempt++) {
    const moved = points.map((point) => ({
      x: clamp(point.x + randomInt(-2, 2), 0, COLS),
      y: clamp(point.y + randomInt(-2, 2), 0, ROWS),
    }))
    if (!isShapeValid(moved, spec)) return moved
  }
  return parkedPoints(points.length)
}

export const describeSpec = (spec: ShapeSpec) =>
  spec.sideLength === undefined ? `any ${spec.shape}` : `a ${spec.shape} with sides of ${spec.sideLength} units`

export const createRound = (index: number): Round => {
  const stage = STAGE_PLAN[Math.min(index, STAGE_PLAN.length - 1)]
  const shape = pick(SHAPE_NAMES)
  const sideLength = shape === 'square' ? randomInt(2, 6) : undefined
  const spec: ShapeSpec = sideLength === undefined ? { shape } : { shape, sideLength }
  if (stage === 'build') return { stage, spec, points: parkedPoints(sidesOf(shape)) }
  if (stage === 'fix') return { stage, spec, points: misplacePoints(createShapePoints(shape, sideLength), spec) }
  return { stage, spec: { shape }, points: createShapePoints(shape) }
}
