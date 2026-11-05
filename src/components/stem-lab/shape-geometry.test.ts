import { describe, expect, it } from 'vitest'
import {
  SHAPE_NAMES,
  type Point,
  type ShapeSpec,
  cornerAngles,
  createRound,
  createShapePoints,
  evaluateShape,
  isShapeValid,
} from './shape-geometry'

const failures = (points: Point[], spec: ShapeSpec) =>
  evaluateShape(points, spec)
    .filter((check) => check.status === 'fail')
    .map((check) => check.problem)

describe('shape geometry checks', () => {
  it('accepts generated targets for every shape', () => {
    for (const shape of SHAPE_NAMES) {
      for (let attempt = 0; attempt < 25; attempt++) {
        expect(isShapeValid(createShapePoints(shape), { shape })).toBe(true)
      }
    }
  })

  it('accepts squares built at the requested side length', () => {
    for (let attempt = 0; attempt < 25; attempt++) {
      expect(isShapeValid(createShapePoints('square', 4), { shape: 'square', sideLength: 4 })).toBe(true)
    }
  })

  it('names the side lengths when a square has unequal sides', () => {
    const rectangle = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }, { x: 0, y: 3 }]
    expect(failures(rectangle, { shape: 'square' })).toContain('Your sides are not all equal (4, 3, 4, 3).')
  })

  it('reports a self-crossing outline', () => {
    const bowtie = [{ x: 0, y: 0 }, { x: 4, y: 4 }, { x: 4, y: 0 }, { x: 0, y: 4 }]
    expect(failures(bowtie, { shape: 'square' })).toContain('Your shape crosses itself.')
  })

  it('fails right angles for a parallelogram that is not a rectangle', () => {
    const parallelogram = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 6, y: 3 }, { x: 2, y: 3 }]
    const rightCheck = evaluateShape(parallelogram, { shape: 'rectangle' }).find((check) => check.id === 'right')
    expect(rightCheck?.status).toBe('fail')
  })

  it('measures a reflex corner on an L shape', () => {
    const lShape = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 4 }, { x: 0, y: 4 }]
    expect(cornerAngles(lShape).map((angle) => Math.round(angle))).toEqual([90, 90, 90, 270, 90, 90])
  })
})

describe('shape rounds', () => {
  it('moves through build, fix and name stages', () => {
    expect(createRound(0).stage).toBe('build')
    expect(createRound(2).stage).toBe('fix')
    expect(createRound(4).stage).toBe('name')
    expect(createRound(20).stage).toBe('name')
  })

  it('starts build and fix rounds in a state that fails the checks', () => {
    for (let attempt = 0; attempt < 25; attempt++) {
      const build = createRound(0)
      expect(isShapeValid(build.points, build.spec)).toBe(false)
      const fix = createRound(2)
      expect(isShapeValid(fix.points, fix.spec)).toBe(false)
    }
  })

  it('shows finished shapes that pass their own rules in name rounds', () => {
    for (let attempt = 0; attempt < 25; attempt++) {
      const round = createRound(4)
      expect(isShapeValid(round.points, round.spec)).toBe(true)
    }
  })
})
