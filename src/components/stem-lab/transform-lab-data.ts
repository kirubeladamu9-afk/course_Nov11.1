export type Point = { x: number; y: number }
export type Transformation =
  | { type: 'translation'; dx: number; dy: number }
  | { type: 'reflection'; line: 'x-axis' | 'y-axis' | 'vertical'; k: number }
  | { type: 'rotation'; angle: 90 | 180 | 270; direction: 'clockwise' | 'counterclockwise'; center: Point }
  | { type: 'dilation'; scale: 0.5 | 2; center: Point }
export type RoundMode = 'apply' | 'find-rule' | 'predict'
export type TransformRound = { original: Point[]; transformations: Transformation[]; mode: RoundMode; ruleChoices: string[] }

const randomItem = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]
const randomEven = (min: number, max: number) => 2 * (min + Math.floor(Math.random() * (max - min + 1)))
const copyPoints = (points: Point[]) => points.map(({ x, y }) => ({ x, y }))
const insideGrid = (points: Point[]) => points.every(({ x, y }) => x >= -8 && x <= 8 && y >= -8 && y <= 8)

const createTriangle = (): Point[] => {
  const lattice = [-4, -2, 0, 2, 4]
  while (true) {
    const points = Array.from({ length: 3 }, () => ({ x: randomItem(lattice), y: randomItem(lattice) }))
    const [a, b, c] = points
    if (new Set(points.map(({ x, y }) => `${x},${y}`)).size !== 3) continue
    if ((b.x - a.x) * (c.y - a.y) !== (b.y - a.y) * (c.x - a.x)) return points
  }
}

const createQuadrilateral = (): Point[] => {
  const x = randomEven(-4, 0)
  const y = randomEven(-4, 0)
  const width = randomItem([2, 4])
  const height = randomItem([2, 4])
  return [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }]
}

export const applyTransformation = (point: Point, transformation: Transformation): Point => {
  if (transformation.type === 'translation') return { x: point.x + transformation.dx, y: point.y + transformation.dy }
  if (transformation.type === 'reflection') {
    if (transformation.line === 'x-axis') return { x: point.x, y: -point.y }
    if (transformation.line === 'y-axis') return { x: -point.x, y: point.y }
    return { x: 2 * transformation.k - point.x, y: point.y }
  }
  if (transformation.type === 'rotation') {
    const x = point.x - transformation.center.x
    const y = point.y - transformation.center.y
    const turns = transformation.angle / 90 * (transformation.direction === 'clockwise' ? -1 : 1)
    const normalizedTurns = (turns + 4) % 4
    const rotated = normalizedTurns === 0 ? { x, y } : normalizedTurns === 1 ? { x: -y, y: x } : normalizedTurns === 2 ? { x: -x, y: -y } : { x: y, y: -x }
    return { x: rotated.x + transformation.center.x, y: rotated.y + transformation.center.y }
  }
  return { x: transformation.center.x + (point.x - transformation.center.x) * transformation.scale, y: transformation.center.y + (point.y - transformation.center.y) * transformation.scale }
}

export const applyTransformations = (points: Point[], transformations: Transformation[]) => transformations.reduce((result, transformation) => result.map((point) => applyTransformation(point, transformation)), copyPoints(points))

const describeTransformation = (transformation: Transformation): string => {
  if (transformation.type === 'translation') return `Translation (${transformation.dx >= 0 ? '+' : '−'}${Math.abs(transformation.dx)}, ${transformation.dy >= 0 ? '+' : '−'}${Math.abs(transformation.dy)})`
  if (transformation.type === 'reflection') return `Reflection across ${transformation.line === 'vertical' ? `x = ${transformation.k}` : `the ${transformation.line}`}`
  if (transformation.type === 'rotation') return `Rotation ${transformation.angle}° ${transformation.direction} about (${transformation.center.x}, ${transformation.center.y})`
  return `Dilation by ${transformation.scale} about (${transformation.center.x}, ${transformation.center.y})`
}

export const describeRule = (transformations: Transformation[]) => transformations.map(describeTransformation).join('; then ')

const createTransformations = (index: number): Transformation[] => {
  if (index === 0) return [{ type: 'translation', dx: randomItem([-3, 3]), dy: randomItem([-2, 2]) }]
  if (index === 1 || index === 2) return [{ type: 'reflection', line: randomItem(['x-axis', 'y-axis'] as const), k: 0 }]
  if (index === 3) return [{ type: 'rotation', angle: 90, direction: randomItem(['clockwise', 'counterclockwise'] as const), center: { x: 0, y: 0 } }]
  if (index === 4) return [{ type: 'rotation', angle: 180, direction: randomItem(['clockwise', 'counterclockwise'] as const), center: { x: 0, y: 0 } }]
  if (index === 5) return [{ type: 'dilation', scale: randomItem([0.5, 2] as const), center: { x: 0, y: 0 } }]
  if (index === 6) return [{ type: 'translation', dx: randomItem([-2, 2]), dy: randomItem([-2, 2]) }, { type: 'reflection', line: 'vertical', k: 1 }]
  const center = { x: 0, y: 0 }
  return [
    { type: 'rotation', angle: randomItem([90, 180, 270] as const), direction: randomItem(['clockwise', 'counterclockwise'] as const), center },
    { type: 'dilation', scale: randomItem([0.5, 2] as const), center },
  ]
}

const createRuleChoices = (transformations: Transformation[]): string[] => {
  const actual = describeRule(transformations)
  const alternatives = [
    'Translation (+2, −4)',
    'Reflection across the x-axis',
    'Reflection across the y-axis',
    'Rotation 90° counterclockwise about (0, 0)',
    'Rotation 180° clockwise about (0, 0)',
    'Dilation by 2 about (0, 0)',
    'Dilation by 0.5 about (0, 0)',
    'Translation (−2, +2); then reflection across the y-axis',
  ].filter((choice) => choice !== actual)
  const choices = [actual, ...alternatives.sort(() => Math.random() - .5).slice(0, 3)]
  return choices.sort(() => Math.random() - .5)
}

export const createTransformRound = (index: number): TransformRound => {
  const mode: RoundMode = (['apply', 'find-rule', 'predict'] as RoundMode[])[index % 3]
  while (true) {
    const original = Math.random() < .5 ? createTriangle() : createQuadrilateral()
    const transformations = createTransformations(Math.min(index, 7))
    if (insideGrid(applyTransformations(original, transformations))) return { original, transformations, mode, ruleChoices: createRuleChoices(transformations) }
  }
}
